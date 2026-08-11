package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "api_keys")
@Data
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "key_hash", nullable = false, unique = true)
    private String keyHash;
    @Column(name = "key_prefix", nullable = false)
    private String keyPrefix;
    @Column(nullable = false)
    private String name;
    private String description;
    @Column(name = "allowed_hosts", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> allowedHosts;
    @Column(name = "allowed_process_ids", columnDefinition = "UUID[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<UUID> allowedProcessIds;
    @Column(columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> permissions;
    @Column(name = "is_active")
    private Boolean isActive = true;
    @Column(name = "last_used_at")
    private Instant lastUsedAt;
    @Column(name = "last_used_ip")
    private String lastUsedIp;
    @Column(name = "expires_at")
    private Instant expiresAt;
    @Column(name = "created_by")
    private String createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @Transient
    private String rawKey;
}
