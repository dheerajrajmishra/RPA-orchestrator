import socket
import os
import time
import json
import traceback
import logging
from contextlib import contextmanager
from typing import Optional

# Resilient import for httpx / urllib fallback
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False
    import urllib.request
    import urllib.error

logger = logging.getLogger("orchestrator.reporter")


class RunReporter:
    """
    Lightweight reporter SDK for RPA processes.
    Reports execution lifecycle to the Orchestrator Reporter API.
    """

    def __init__(
        self,
        api_base: str,
        process_slug: str,
        api_key: str,
        timeout: int = 15,
        heartbeat_interval: int = 60,
    ):
        self.api = api_base.rstrip("/")
        self.slug = process_slug
        self.timeout = timeout
        self.heartbeat_interval = heartbeat_interval
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json",
        }
        self.run_id: Optional[str] = None
        self._step_order = 0
        self._last_heartbeat = 0

    def start_run(self, trigger: str = "scheduled", params: dict = None) -> str:
        """Call at process start. Returns run_id."""
        resp = self._post("/reporter/v1/runs", {
            "processSlug": self.slug,
            "trigger": trigger,
            "workerHost": socket.gethostname(),
            "workerPid": os.getpid(),
            "inputParams": params or {},
        })
        self.run_id = resp.get("runId") or resp.get("id")
        self._last_heartbeat = time.time()
        logger.info(f"Run started: {self.run_id}")
        return self.run_id

    @contextmanager
    def step(self, step_name: str):
        """Context manager for step tracking."""
        self._step_order += 1
        self._maybe_heartbeat()

        resp = self._post(f"/reporter/v1/runs/{self.run_id}/steps", {
            "stepName": step_name,
            "stepOrder": self._step_order,
        })
        step_id = resp.get("stepId") or resp.get("id")
        logger.info(f"Step started: {step_name} (ID: {step_id})")

        try:
            yield step_id
            self._patch(f"/reporter/v1/runs/{self.run_id}/steps/{step_id}", {
                "status": "success",
            })
            logger.info(f"Step completed: {step_name}")
        except Exception as e:
            if step_id:
                self._patch(f"/reporter/v1/runs/{self.run_id}/steps/{step_id}", {
                    "status": "failed",
                    "errorMessage": str(e),
                })
            logger.error(f"Step failed: {step_name} — {e}")
            raise

    def log(self, message: str, level: str = "INFO", step_id: str = None, context: dict = None):
        """Send a structured log line."""
        self._maybe_heartbeat()
        self._post(f"/reporter/v1/runs/{self.run_id}/logs", {
            "logLevel": level,
            "message": message,
            "stepId": step_id,
            "context": context or {},
        })

    def log_batch(self, logs: list[dict]):
        """Send multiple log lines at once. Each dict: {message, level, stepId?, context?}"""
        self._post(f"/reporter/v1/runs/{self.run_id}/logs/batch", {
            "logs": [{
                "logLevel": l.get("level", "INFO"),
                "message": l["message"],
                "stepId": l.get("stepId"),
                "context": l.get("context", {}),
            } for l in logs]
        })

    def heartbeat(self):
        """Explicit heartbeat. Called automatically during step() and log()."""
        if self.run_id:
            self._post(f"/reporter/v1/runs/{self.run_id}/heartbeat", {})
            self._last_heartbeat = time.time()

    def complete(
        self,
        success: bool = True,
        records_processed: int = 0,
        records_failed: int = 0,
        output_summary: dict = None,
        error: str = None,
    ):
        """Call at process end. Must be called even on failure."""
        if not self.run_id:
            logger.warning("complete() called without active run_id")
            return

        self._patch(f"/reporter/v1/runs/{self.run_id}", {
            "status": "success" if success else "failed",
            "recordsProcessed": records_processed,
            "recordsFailed": records_failed,
            "outputSummary": output_summary or {},
            "errorMessage": error,
            "errorTraceback": traceback.format_exc() if error else None,
            "errorCategory": self._categorize_error(error) if error else None,
        })
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"Run completed: {self.run_id} — {status}")

    # ── Internal HTTP helpers ───────────────────────────────────

    def _post(self, path: str, body: dict) -> dict:
        return self._request("POST", path, body)

    def _patch(self, path: str, body: dict) -> dict:
        return self._request("PATCH", path, body)

    def _request(self, method: str, path: str, body: dict) -> dict:
        url = f"{self.api}{path}"
        data_bytes = json.dumps(body).encode("utf-8")

        if HAS_HTTPX:
            try:
                resp = httpx.request(method, url, content=data_bytes, headers=self.headers, timeout=self.timeout)
                resp.raise_for_status()
                if resp.content and len(resp.content.strip()) > 0:
                    try:
                        return resp.json()
                    except Exception:
                        return {}
                return {}
            except Exception as e:
                logger.warning(f"Reporter API {method} call failed: {path} — {e}")
                return {}
        else:
            # Fallback to standard library urllib
            try:
                req = urllib.request.Request(url, data=data_bytes, headers=self.headers, method=method)
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    content = response.read()
                    if content and len(content.strip()) > 0:
                        try:
                            return json.loads(content.decode("utf-8"))
                        except Exception:
                            return {}
                    return {}
            except Exception as e:
                logger.warning(f"Reporter API {method} call failed: {path} — {e}")
                return {}

    def _maybe_heartbeat(self):
        if time.time() - self._last_heartbeat > self.heartbeat_interval:
            self.heartbeat()

    @staticmethod
    def _categorize_error(error: str) -> str:
        if not error:
            return "unknown"
        e = error.lower()
        if any(k in e for k in ["timeout", "timed out"]):
            return "timeout"
        if any(k in e for k in ["connection", "network", "dns", "unreachable", "503", "502"]):
            return "network"
        if any(k in e for k in ["auth", "401", "403", "forbidden", "credential"]):
            return "auth"
        if any(k in e for k in ["validation", "invalid", "missing", "format", "parse"]):
            return "data_validation"
        return "unknown"
