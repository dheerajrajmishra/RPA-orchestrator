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
@Table(name = "api_keys")
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "key_hash", nullable = false, unique = true, length = 128)
    private String keyHash;

    @Column(name = "key_prefix", nullable = false, length = 64)
    private String keyPrefix;

    @Column(nullable = false)
    private String name;

    private String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_hosts")
    private List<String> allowedHosts;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_process_ids")
    private List<UUID> allowedProcessIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> permissions;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_used_at")
    private OffsetDateTime lastUsedAt;

    @Column(name = "last_used_ip", length = 45)
    private String lastUsedIp;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
