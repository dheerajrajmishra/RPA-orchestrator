package com.rpa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "process_run_logs")
public class ProcessRunLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(name = "step_id")
    private UUID stepId;

    @Column(name = "log_level", nullable = false, length = 10)
    private String logLevel = "INFO";

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(columnDefinition = "jsonb")
    private String context;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }
}
