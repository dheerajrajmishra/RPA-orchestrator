package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "process_registry")
@Data
public class ProcessRegistry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String slug;
    private String description;
    @Column(name = "script_path")
    private String scriptPath;
    @Column(name = "worker_host")
    private String workerHost;
}
