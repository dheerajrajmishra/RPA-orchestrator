package com.rpa.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "process_registry")
public class ProcessRegistry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String description;
    private String category;

    @Column(name = "script_path", nullable = false, length = 512)
    private String scriptPath;

    @Column(name = "worker_host", nullable = false)
    private String workerHost;

    @Column(name = "worker_os", length = 20)
    private String workerOs = "windows";

    @Column(name = "declared_schedule")
    private String declaredSchedule;

    @Column(name = "declared_cron", length = 100)
    private String declaredCron;

    @Column(name = "schedule_timezone", length = 50)
    private String scheduleTimezone = "Asia/Seoul";

    @Column(name = "expected_duration_s")
    private Integer expectedDurationS;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 3600;

    @Column(name = "max_retries")
    private Integer maxRetries = 0;

    @Column(name = "process_version", length = 50)
    private String processVersion = "1.0.0";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "jsonb")
    private String config;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> tags;

    private String owner;
    private String notes;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
