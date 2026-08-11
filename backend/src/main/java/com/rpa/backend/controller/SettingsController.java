package com.rpa.backend.controller;
import com.rpa.backend.entity.SystemSetting;
import com.rpa.backend.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    @Autowired private SystemSettingRepository repo;
    
    @GetMapping
    public List<SystemSetting> getAll() {
        return repo.findAll();
    }
    
    @PostMapping
    public SystemSetting create(@RequestBody SystemSetting s) {
        return repo.save(s);
    }
}
