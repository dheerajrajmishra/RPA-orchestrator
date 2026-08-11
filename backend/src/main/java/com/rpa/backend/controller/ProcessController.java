package com.rpa.backend.controller;
import com.rpa.backend.entity.ProcessRegistry;
import com.rpa.backend.repository.ProcessRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/processes")
@RequiredArgsConstructor
public class ProcessController {
    private final ProcessRegistryRepository repository;

    @GetMapping
    @PreAuthorize("hasAuthority('process:read')")
    public List<ProcessRegistry> getAll() {
        return repository.findAll();
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('process:write')")
    public ProcessRegistry create(@RequestBody ProcessRegistry process) {
        return repository.save(process);
    }
}
