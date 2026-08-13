package com.rpa.backend.controller;

import com.rpa.backend.entity.Role;
import com.rpa.backend.entity.User;
import com.rpa.backend.repository.RoleRepository;
import com.rpa.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AccessController {
    @Autowired private UserRepository userRepo;
    @Autowired private RoleRepository roleRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    
    @GetMapping("/users")
    public Object getUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            return userRepo.findAll(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("email").ascending()));
        }
        return userRepo.findAll();
    }
    
    @PostMapping("/users")
    public User createUser(@RequestBody Map<String, Object> body) {
        User user = new User();
        String email = body.containsKey("email") && body.get("email") != null ? String.valueOf(body.get("email")) : "user@company.local";
        String name = body.containsKey("name") && body.get("name") != null ? String.valueOf(body.get("name")) : email.split("@")[0];
        String username = body.containsKey("username") && body.get("username") != null ? String.valueOf(body.get("username")) : name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "_");
        
        user.setEmail(email);
        user.setUsername(username);
        user.setDisplayName(name);
        String rawPassword = body.containsKey("password") && body.get("password") != null && !String.valueOf(body.get("password")).isBlank()
                ? String.valueOf(body.get("password"))
                : "Welcome@123";
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        
        if (body.containsKey("roleId") && body.get("roleId") != null) {
            try {
                UUID roleId = UUID.fromString(String.valueOf(body.get("roleId")));
                roleRepo.findById(roleId).ifPresent(user::setRole);
            } catch (Exception ignored) {}
        }
        
        return userRepo.save(user);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        return userRepo.findById(id).map(user -> {
            if (body.containsKey("name") && body.get("name") != null && !String.valueOf(body.get("name")).isBlank()) {
                user.setDisplayName(String.valueOf(body.get("name")));
            }
            if (body.containsKey("email") && body.get("email") != null && !String.valueOf(body.get("email")).isBlank()) {
                user.setEmail(String.valueOf(body.get("email")));
            }
            if (body.containsKey("password") && body.get("password") != null && !String.valueOf(body.get("password")).isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(String.valueOf(body.get("password"))));
            }
            if (body.containsKey("roleId") && body.get("roleId") != null) {
                try {
                    UUID roleId = UUID.fromString(String.valueOf(body.get("roleId")));
                    roleRepo.findById(roleId).ifPresent(user::setRole);
                } catch (Exception ignored) {}
            }
            if (body.containsKey("status") && body.get("status") != null) {
                String status = String.valueOf(body.get("status"));
                user.setIsActive("Active".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status));
            }
            return userRepo.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping("/roles")
    public List<Role> getRoles() {
        return roleRepo.findAll();
    }
    
    @PostMapping("/roles")
    public Role createRole(@RequestBody Role r) {
        return roleRepo.save(r);
    }
    
    @PutMapping("/roles/{id}/permissions")
    public Role updateRolePermissions(@PathVariable UUID id, @RequestBody Set<String> permissions) {
        return roleRepo.findById(id).map(r -> {
            r.setPermissions(permissions);
            return roleRepo.save(r);
        }).orElseThrow(() -> new RuntimeException("Role not found"));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userRepo.deleteById(id);
    }

    @DeleteMapping("/roles/{id}")
    public void deleteRole(@PathVariable UUID id) {
        roleRepo.deleteById(id);
    }
}
