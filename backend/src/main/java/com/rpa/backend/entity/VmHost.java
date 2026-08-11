package com.rpa.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "vm_hosts")
@Data
public class VmHost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String hostname;

    private String category;

    @Column(name = "ip_address")
    private String ipAddress;

    private String status = "offline";

    @Column(name = "last_seen")
    private Instant lastSeen;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public String getName() {
        return hostname;
    }

    public void setName(String name) {
        if (this.hostname == null || this.hostname.isBlank()) {
            this.hostname = name;
        }
    }
}
