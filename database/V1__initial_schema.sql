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

CREATE INDEX idx_proc_category ON process_registry (category);
CREATE INDEX idx_proc_active   ON process_registry (is_active);
CREATE INDEX idx_proc_host     ON process_registry (worker_host);
CREATE INDEX idx_proc_tags     ON process_registry USING GIN (tags);


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

CREATE INDEX idx_api_keys_hash   ON api_keys (key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_prefix ON api_keys (key_prefix);


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

CREATE INDEX idx_runs_process     ON process_runs (process_id);
CREATE INDEX idx_runs_status      ON process_runs (status);
CREATE INDEX idx_runs_started     ON process_runs (started_at DESC);
CREATE INDEX idx_runs_proc_status ON process_runs (process_id, status, started_at DESC);
CREATE INDEX idx_runs_heartbeat   ON process_runs (heartbeat_at) WHERE status = 'running';


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

CREATE INDEX idx_steps_run ON process_run_steps (run_id, step_order);


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

CREATE INDEX idx_logs_run    ON process_run_logs (run_id, created_at);
CREATE INDEX idx_logs_errors ON process_run_logs (log_level) WHERE log_level IN ('ERROR','CRITICAL');


-- ── PROCESS DEPENDENCIES ─────────────────────────────────────────
CREATE TABLE process_dependencies (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id              UUID NOT NULL REFERENCES process_registry(id) ON DELETE CASCADE,
    depends_on_process_id   UUID NOT NULL REFERENCES process_registry(id) ON DELETE CASCADE,
    dependency_type         VARCHAR(20) DEFAULT 'success'
                            CHECK (dependency_type IN ('success','completion','any')),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_dep      UNIQUE (process_id, depends_on_process_id),
    CONSTRAINT no_self_dep  CHECK (process_id != depends_on_process_id)
);


-- ── ALERT RULES ──────────────────────────────────────────────────
CREATE TABLE alert_rules (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id        UUID REFERENCES process_registry(id) ON DELETE CASCADE,
    alert_type        VARCHAR(50) NOT NULL
                      CHECK (alert_type IN ('failure','timeout','sla_breach','consecutive_failures','no_run_in_window')),
    threshold         INT          DEFAULT 1,
    sla_seconds       INT,
    lookback_seconds  INT,
    channel           VARCHAR(50)  NOT NULL
                      CHECK (channel IN ('email','slack','teams','webhook')),
    channel_config    JSONB        NOT NULL,
    is_active         BOOLEAN      DEFAULT TRUE,
    cooldown_seconds  INT          DEFAULT 3600,
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);


-- ── ALERT HISTORY ────────────────────────────────────────────────
CREATE TABLE alert_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id   UUID         NOT NULL REFERENCES alert_rules(id),
    run_id          UUID         REFERENCES process_runs(id),
    process_id      UUID         REFERENCES process_registry(id),
    message         TEXT         NOT NULL,
    sent_at         TIMESTAMPTZ  DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(255)
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


-- ── AUDIT LOG ────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id          BIGSERIAL    PRIMARY KEY,
    actor_type  VARCHAR(20)  NOT NULL,
    actor_id    VARCHAR(255) NOT NULL,
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(100),
    resource_id VARCHAR(255),
    details     JSONB        DEFAULT '{}',
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_audit_actor    ON audit_log (actor_type, actor_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_log (resource, resource_id);


-- ── VIEWS ────────────────────────────────────────────────────────
CREATE VIEW v_process_overview AS
SELECT DISTINCT ON (p.id)
    p.id AS process_id, p.name AS process_name, p.slug, p.category,
    p.worker_host, p.is_active, p.declared_schedule, p.declared_cron,
    p.expected_duration_s, p.owner, p.tags,
    r.id AS last_run_id, r.status AS last_run_status,
    r.trigger AS last_run_trigger, r.started_at AS last_run_started,
    r.completed_at AS last_run_completed, r.duration_ms AS last_run_duration_ms,
    r.records_processed AS last_run_records, r.error_message AS last_run_error,
    r.error_category AS last_run_error_cat, r.heartbeat_at AS last_heartbeat
FROM process_registry p
LEFT JOIN process_runs r ON r.process_id = p.id
ORDER BY p.id, r.started_at DESC NULLS LAST;

CREATE VIEW v_process_stats_30d AS
SELECT
    p.id AS process_id, p.name AS process_name, p.category, p.worker_host,
    COUNT(r.id) AS total_runs,
    COUNT(*) FILTER (WHERE r.status = 'success') AS success_count,
    COUNT(*) FILTER (WHERE r.status = 'failed') AS failure_count,
    COUNT(*) FILTER (WHERE r.status = 'timeout') AS timeout_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE r.status = 'success') / NULLIF(COUNT(r.id), 0), 1) AS success_rate_pct,
    ROUND(AVG(r.duration_ms / 1000.0)::numeric, 1) AS avg_duration_sec,
    SUM(r.records_processed) AS total_records,
    MAX(r.started_at) AS last_run_at
FROM process_registry p
LEFT JOIN process_runs r ON r.process_id = p.id AND r.started_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.category, p.worker_host;

CREATE VIEW v_active_runs AS
SELECT
    r.id AS run_id, p.name AS process_name, p.slug, r.status,
    r.started_at, r.heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - r.started_at))::INT AS elapsed_seconds,
    EXTRACT(EPOCH FROM (NOW() - r.heartbeat_at))::INT AS heartbeat_age_seconds,
    p.timeout_seconds, r.worker_host, r.worker_pid, r.attempt_number,
    CASE WHEN r.heartbeat_at < NOW() - INTERVAL '5 minutes' AND r.status = 'running'
         THEN TRUE ELSE FALSE END AS possibly_stale
FROM process_runs r
JOIN process_registry p ON p.id = r.process_id
WHERE r.status IN ('queued', 'running')
ORDER BY r.started_at;

CREATE VIEW v_recent_failures AS
SELECT
    r.id AS run_id, p.name AS process_name, p.worker_host,
    r.started_at, r.completed_at, r.duration_ms,
    r.error_category, r.error_message, r.attempt_number, r.trigger
FROM process_runs r
JOIN process_registry p ON p.id = r.process_id
WHERE r.status IN ('failed', 'timeout')
  AND r.started_at >= NOW() - INTERVAL '7 days'
ORDER BY r.started_at DESC;


-- ── TIMESTAMP TRIGGER ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proc_updated
    BEFORE UPDATE ON process_registry
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ── DATABASE USERS (Note: In standard postgres docker, these might fail if not superuser, but included for completeness) ──
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'reporter_svc') THEN
      CREATE USER reporter_svc WITH PASSWORD 'reporter_pass';
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'backend_svc') THEN
      CREATE USER backend_svc WITH PASSWORD 'backend_pass';
   END IF;
END
$do$;

GRANT SELECT ON process_registry, api_keys TO reporter_svc;
GRANT SELECT, INSERT, UPDATE ON process_runs, process_run_steps, process_run_logs TO reporter_svc;
GRANT INSERT ON audit_log TO reporter_svc;
GRANT USAGE ON SEQUENCE process_run_logs_id_seq TO reporter_svc;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO backend_svc;
GRANT INSERT, UPDATE, DELETE ON process_registry, alert_rules, alert_history, api_keys, users, roles, role_permissions, audit_log TO backend_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO backend_svc;
