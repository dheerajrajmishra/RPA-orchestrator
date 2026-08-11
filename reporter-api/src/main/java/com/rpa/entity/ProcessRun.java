package com.rpa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "process_runs")
public class ProcessRun {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "process_id", nullable = true)
    private UUID processId;

    @Transient
    private String processSlug;

    public UUID getRunId() {
        return id;
    }

    public void setRunId(UUID runId) {
        this.id = runId;
    }

    @Column(nullable = false)
    private String trigger = "scheduled";

    @Column(nullable = false)
    private String status = "running";

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "duration_ms", insertable = false, updatable = false)
    private Long durationMs;

    @Column(name = "heartbeat_at")
    private OffsetDateTime heartbeatAt;

    @Column(name = "worker_host", nullable = false)
    private String workerHost;

    @Column(name = "worker_pid")
    private Integer workerPid;

    @Column(name = "attempt_number")
    private Integer attemptNumber = 1;

    @Column(name = "parent_run_id")
    private UUID parentRunId;

    @Column(name = "input_params", columnDefinition = "jsonb")
    private String inputParams;

    @Column(name = "output_summary", columnDefinition = "jsonb")
    private String outputSummary;

    @Column(name = "records_processed")
    private Integer recordsProcessed = 0;

    @Column(name = "records_failed")
    private Integer recordsFailed = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "error_traceback")
    private String errorTraceback;

    @Column(name = "error_category")
    private String errorCategory;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (startedAt == null) startedAt = OffsetDateTime.now();
        if (heartbeatAt == null) heartbeatAt = OffsetDateTime.now();
    }
}
