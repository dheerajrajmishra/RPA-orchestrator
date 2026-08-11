package com.rpa.backend.controller;
import com.rpa.backend.entity.AuditLog;
import com.rpa.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {
    @Autowired private AuditLogRepository repo;
    
    @GetMapping
    public List<AuditLog> getAll() {
        return repo.findAll();
    }
}
