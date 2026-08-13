package com.rpa.backend.controller;
import com.rpa.backend.entity.AuditLog;
import com.rpa.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {
    @Autowired private AuditLogRepository repo;
    
    @GetMapping
    public Object getAll(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            return repo.findAll(PageRequest.of(page, size, Sort.by("timestamp").descending()));
        }
        return repo.findAll();
    }
}
