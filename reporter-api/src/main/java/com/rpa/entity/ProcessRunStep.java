package com.rpa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "process_run_steps")
public class ProcessRunStep {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    public UUID getStepId() {
        return id;
    }

    public void setStepId(UUID stepId) {
        this.id = stepId;
    }

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(nullable = false)
    private String status = "queued";

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "duration_ms", insertable = false, updatable = false)
    private Long durationMs;

    @Column(name = "records_in")
    private Integer recordsIn = 0;

    @Column(name = "records_out")
    private Integer recordsOut = 0;

    @Column(columnDefinition = "jsonb")
    private String details;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }
}
