package com.rpa.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    private String displayName;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;
    
    private Boolean isActive = true;

    public String getName() {
        return displayName != null ? displayName : username;
    }

    public void setName(String name) {
        if (this.displayName == null || this.displayName.isBlank()) {
            this.displayName = name;
        }
        if (this.username == null || this.username.isBlank()) {
            this.username = name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "_");
        }
    }
}
