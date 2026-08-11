# RPA Orchestrator — Full System Build Specification

## Overview

Build a custom RPA (Robotic Process Automation) orchestration and monitoring platform. This is a **Phase 1 passive observation system** — scheduling remains on individual VMs via OS Task Scheduler. The orchestrator provides centralized visibility into execution across all VMs.

**The system has three deployable components:**

```
rpa_orchestrator/
├── frontend/              → Next.js 14+ (App Router) dashboard
├── backend/               → Java 21 + Spring Boot 3.x core API (dashboard-facing)
├── reporter-api/          → Java 21 + Spring Boot 3.x ingest API (VM-facing, secured with API keys)
└── database/              → PostgreSQL 14+ migration scripts (or embedded in Spring Boot)
```

> **IMPORTANT**: `backend` and `reporter-api` are two completely separate Spring Boot applications. They do not share a Maven module. They will both connect to the same PostgreSQL database, and it's acceptable for them to duplicate JPA Entity classes for the tables they both need access to.

---

## 1. DATABASE LAYER

### Technology
- PostgreSQL 14+
- Flyway for migrations (integrated into both Java services, or you can pick one to run migrations)

### Schema (V1__initial_schema.sql)

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── PROCESS REGISTRY ─────────────────────────────────────────────
CREATE TABLE process_registry (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL UNIQUE,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    description         TEXT,
    category            VARCHAR(100),
    script_path         VARCHAR(512) NOT NULL,
    worker_host         VARCHAR(255) NOT NULL,
    worker_os           VARCHAR(20)  DEFAULT 'windows',
    declared_schedule   VARCHAR(255),
    declared_cron       VARCHAR(100),
    schedule_timezone   VARCHAR(50)  DEFAULT 'Asia/Seoul',
    expected_duration_s INT,
    timeout_seconds     INT          DEFAULT 3600,
    max_retries         INT          DEFAULT 0,
    process_version     VARCHAR(50)  DEFAULT '1.0.0',
    is_active           BOOLEAN      DEFAULT TRUE,
    config              JSONB        DEFAULT '{}',
    tags                TEXT[]       DEFAULT '{}',
    owner               VARCHAR(255),
    notes               TEXT,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ── API KEYS (for reporter-api authentication) ───────────────────
CREATE TABLE api_keys (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash        VARCHAR(128) NOT NULL UNIQUE,
    key_prefix      VARCHAR(10)  NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    allowed_hosts   TEXT[],
    allowed_process_ids UUID[],
    permissions     TEXT[]       DEFAULT '{report}',
    is_active       BOOLEAN      DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    last_used_ip    VARCHAR(45),
    expires_at      TIMESTAMPTZ,
    created_by      VARCHAR(255),
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── PROCESS RUNS ─────────────────────────────────────────────────
CREATE TYPE run_status   AS ENUM ('queued','running','success','failed','timeout','cancelled','skipped');
CREATE TYPE trigger_type AS ENUM ('scheduled','manual','dependency','retry','api','webhook');

CREATE TABLE process_runs (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id          UUID         NOT NULL REFERENCES process_registry(id),
    trigger             trigger_type NOT NULL DEFAULT 'scheduled',
    status              run_status   NOT NULL DEFAULT 'running',
    started_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    duration_ms         BIGINT       GENERATED ALWAYS AS (
                            CASE WHEN started_at IS NOT NULL AND completed_at IS NOT NULL
                                 THEN EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
                            END
                        ) STORED,
    heartbeat_at        TIMESTAMPTZ  DEFAULT NOW(),
    worker_host         VARCHAR(255) NOT NULL,
    worker_pid          INT,
    attempt_number      INT          DEFAULT 1,
    parent_run_id       UUID         REFERENCES process_runs(id),
    input_params        JSONB        DEFAULT '{}',
    output_summary      JSONB        DEFAULT '{}',
    records_processed   INT          DEFAULT 0,
    records_failed      INT          DEFAULT 0,
    error_message       TEXT,
    error_traceback     TEXT,
    error_category      VARCHAR(100),
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ── PROCESS RUN STEPS ────────────────────────────────────────────
CREATE TABLE process_run_steps (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID         NOT NULL REFERENCES process_runs(id) ON DELETE CASCADE,
    step_name       VARCHAR(255) NOT NULL,
    step_order      INT          NOT NULL,
    status          run_status   NOT NULL DEFAULT 'queued',
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    duration_ms     BIGINT       GENERATED ALWAYS AS (
                        CASE WHEN started_at IS NOT NULL AND completed_at IS NOT NULL
                             THEN EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
                        END
                    ) STORED,
    records_in      INT          DEFAULT 0,
    records_out     INT          DEFAULT 0,
    details         JSONB        DEFAULT '{}',
    error_message   TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── PROCESS RUN LOGS ─────────────────────────────────────────────
CREATE TABLE process_run_logs (
    id          BIGSERIAL    PRIMARY KEY,
    run_id      UUID         NOT NULL REFERENCES process_runs(id) ON DELETE CASCADE,
    step_id     UUID         REFERENCES process_run_steps(id),
    log_level   VARCHAR(10)  NOT NULL DEFAULT 'INFO'
                CHECK (log_level IN ('DEBUG','INFO','WARN','ERROR','CRITICAL')),
    message     TEXT         NOT NULL,
    context     JSONB        DEFAULT '{}',
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── DASHBOARD ROLES AND USERS (DYNAMIC) ──────────────────────────
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    PRIMARY KEY (role_id, permission)
);

CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    role_id         UUID         REFERENCES roles(id),
    is_active       BOOLEAN      DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Other tables like alert_rules, alert_history, audit_log, and views...
```

---

## 2. REPORTER-API (VM-facing ingest service)

- **Purpose**: This is the **only service RPA processes on VMs communicate with**. Write-heavy, append-only semantics. Secured via API key authentication.
- **Tech Stack**: Java 21, Spring Boot 3.x, Spring Data JPA, Bucket4j for rate limit.
- **Security**: Custom `ApiKeyAuthFilter` checking `X-API-Key` against `api_keys` table.

Endpoints:
```
POST   /reporter/v1/runs                 → Start a new run
PATCH  /reporter/v1/runs/{runId}         → Complete a run (success/failed/timeout/cancelled)
POST   /reporter/v1/runs/{runId}/heartbeat → Update heartbeat timestamp
POST   /reporter/v1/runs/{runId}/steps   → Report a step started
PATCH  /reporter/v1/runs/{runId}/steps/{stepId} → Complete a step
POST   /reporter/v1/runs/{runId}/logs    → Ingest a single log line
POST   /reporter/v1/runs/{runId}/logs/batch → Ingest multiple log lines
GET    /health                            → Health check
```

---

## 3. BACKEND (Dashboard-facing API)

- **Purpose**: Serves the Next.js frontend. Read-heavy. Secured via JWT authentication.
- **Tech Stack**: Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA.
- **Security**: JWT tokens. Roles/Permissions based on dynamic `roles` and `role_permissions` tables.

Endpoints include Auth (`/api/v1/auth/*`), Dashboard aggregations (`/api/v1/dashboard/*`), Processes CRUD, Runs read-only, API Key Management (admin), Roles/Permissions Management (admin), Users Management (admin).

---

## 4. FRONTEND (Next.js Dashboard)

- **Tech Stack**: Next.js 14+ (App Router), Tailwind CSS, Recharts, Zustand, React Query.
- **Features**: Light/Dark mode theming.
- **Screens**:
  - Dashboard (StatsGrid, Process Overview Table)
  - Process List & Create Process Form
  - Process Detail & Run History
  - Run Detail (Timeline, Logs with WebSockets)
  - Active Runs
  - Failures
  - API Keys
  - User & Permission Management: Screens to add/edit dynamic roles, assign permissions, and add/edit users.

---
## 5. PYTHON SDK

Provided by Main Agent.
