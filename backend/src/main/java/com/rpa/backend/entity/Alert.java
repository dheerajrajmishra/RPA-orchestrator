package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "alerts")
@Data
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String severity;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    private String source;
    private String status = "active";
    @CreationTimestamp
    @Column(updatable = false)
    private Instant timestamp;
}
