package com.rpa.backend.controller;
import com.rpa.backend.entity.Alert;
import com.rpa.backend.entity.AlertRule;
import com.rpa.backend.repository.AlertRepository;
import com.rpa.backend.repository.AlertRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    @Autowired private AlertRepository alertRepo;
    @Autowired private AlertRuleRepository ruleRepo;
    
    @GetMapping
    public List<Alert> getAlerts() {
        return alertRepo.findAll();
    }
    
    @PostMapping("/{id}/acknowledge")
    public void ackAlert(@PathVariable UUID id) {
        alertRepo.findById(id).ifPresent(a -> {
            a.setStatus("acknowledged");
            alertRepo.save(a);
        });
    }
    
    @GetMapping("/rules")
    public List<AlertRule> getRules() {
        return ruleRepo.findAll();
    }
    
    @PostMapping("/rules")
    public AlertRule createRule(@RequestBody AlertRule r) {
        return ruleRepo.save(r);
    }
    
    @PutMapping("/rules/{id}/toggle")
    public AlertRule toggleRule(@PathVariable UUID id) {
        return ruleRepo.findById(id).map(r -> {
            r.setEnabled(!r.getEnabled());
            return ruleRepo.save(r);
        }).orElseThrow(() -> new RuntimeException("Rule not found"));
    }
}
