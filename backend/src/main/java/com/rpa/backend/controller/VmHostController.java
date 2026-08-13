package com.rpa.backend.controller;

import com.rpa.backend.entity.VmHost;
import com.rpa.backend.repository.VmHostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hosts")
public class VmHostController {
    @Autowired private VmHostRepository repo;
    
    @GetMapping
    public Object getAll(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            return repo.findAll(PageRequest.of(page, size, Sort.by("hostname").ascending()));
        }
        return repo.findAll();
    }
    
    @PostMapping
    public VmHost create(@RequestBody VmHost entity) {
        if (entity.getHostname() == null || entity.getHostname().isBlank()) {
            if (entity.getName() != null && !entity.getName().isBlank()) {
                entity.setHostname(entity.getName());
            }
        }
        return repo.save(entity);
    }
    
    @PutMapping("/{id}")
    public VmHost update(@PathVariable UUID id, @RequestBody VmHost update) {
        return repo.findById(id).map(host -> {
            String newHostname = update.getHostname() != null ? update.getHostname() : update.getName();
            if (newHostname != null && !newHostname.isBlank()) {
                host.setHostname(newHostname);
            }
            if (update.getCategory() != null) {
                host.setCategory(update.getCategory());
            }
            if (update.getIpAddress() != null) {
                host.setIpAddress(update.getIpAddress());
            }
            if (update.getStatus() != null) {
                host.setStatus(update.getStatus());
            }
            return repo.save(host);
        }).orElseThrow(() -> new RuntimeException("Host not found with ID: " + id));
    }

    @PatchMapping("/{id}")
    public VmHost patch(@PathVariable UUID id, @RequestBody VmHost update) {
        return update(id, update);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        repo.deleteById(id);
    }
}
