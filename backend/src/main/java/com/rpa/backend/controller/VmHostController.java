package com.rpa.backend.controller;
import com.rpa.backend.entity.VmHost;
import com.rpa.backend.repository.VmHostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hosts")
public class VmHostController {
    @Autowired private VmHostRepository repo;
    
    @GetMapping
    public List<VmHost> getAll() {
        return repo.findAll();
    }
    
    @PostMapping
    public VmHost create(@RequestBody VmHost entity) {
        return repo.save(entity);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        repo.deleteById(id);
    }
}
