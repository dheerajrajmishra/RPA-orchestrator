package com.rpa.backend.controller;
import com.rpa.backend.entity.ApiKey;
import com.rpa.backend.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.security.MessageDigest;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/keys")
public class ApiKeyController {
    @Autowired private ApiKeyRepository repo;
    
    @GetMapping
    public List<ApiKey> getAll() {
        return repo.findAll();
    }
    
    @PostMapping
    public ApiKey create(@RequestBody ApiKey entity) {
        String rawKey = UUID.randomUUID().toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            entity.setKeyHash(Base64.getEncoder().encodeToString(hash));
            entity.setKeyPrefix(rawKey.substring(0, 8));
        } catch(Exception e) {
            throw new RuntimeException("Failed to generate API Key", e);
        }
        ApiKey saved = repo.save(entity);
        saved.setRawKey(rawKey); // Only returned once
        return saved;
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        repo.deleteById(id);
    }
}
