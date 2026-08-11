package com.rpa.backend.controller;
import com.rpa.backend.entity.Role;
import com.rpa.backend.entity.User;
import com.rpa.backend.repository.RoleRepository;
import com.rpa.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AccessController {
    @Autowired private UserRepository userRepo;
    @Autowired private RoleRepository roleRepo;
    
    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepo.findAll();
    }
    
    @PostMapping("/users")
    public User createUser(@RequestBody User u) {
        return userRepo.save(u);
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
}
