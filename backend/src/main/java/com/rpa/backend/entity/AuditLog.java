package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @CreationTimestamp
    @Column(updatable = false)
    private Instant timestamp;
    @Column(nullable = false)
    private String actor;
    @Column(nullable = false)
    private String action;
    private String resource;
    private String ip;
    @Column(nullable = false)
    private String type;
}
