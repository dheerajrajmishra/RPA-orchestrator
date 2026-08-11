import os
import textwrap

base_pkg = 'C:/Users/dhiraj.k3/.gemini/antigravity/scratch/rpa_orchestrator/backend/src/main/java/com/rpa/backend'

def write(path, content):
    full_path = os.path.join(base_pkg, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(textwrap.dedent(content).strip())

write('entity/VmHost.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "vm_hosts")
@Data
public class VmHost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true)
    private String hostname;
    private String category;
    @Column(name = "ip_address")
    private String ipAddress;
    private String status = "offline";
    @Column(name = "last_seen")
    private Instant lastSeen;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
''')

write('entity/ApiKey.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "api_keys")
@Data
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "key_hash", nullable = false, unique = true)
    private String keyHash;
    @Column(name = "key_prefix", nullable = false)
    private String keyPrefix;
    @Column(nullable = false)
    private String name;
    private String description;
    @Column(name = "allowed_hosts", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> allowedHosts;
    @Column(name = "allowed_process_ids", columnDefinition = "UUID[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<UUID> allowedProcessIds;
    @Column(columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> permissions;
    @Column(name = "is_active")
    private Boolean isActive = true;
    @Column(name = "last_used_at")
    private Instant lastUsedAt;
    @Column(name = "last_used_ip")
    private String lastUsedIp;
    @Column(name = "expires_at")
    private Instant expiresAt;
    @Column(name = "created_by")
    private String createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @Transient
    private String rawKey;
}
''')

write('entity/Alert.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "alerts")
@Data
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String severity;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    private String source;
    private String status = "active";
    @CreationTimestamp
    @Column(updatable = false)
    private Instant timestamp;
}
''')

write('entity/AlertRule.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "alert_rules")
@Data
public class AlertRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String condition;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String action;
    private Boolean enabled = true;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
''')

write('entity/AuditLog.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @CreationTimestamp
    @Column(updatable = false)
    private Instant timestamp;
    @Column(nullable = false)
    private String actor;
    @Column(nullable = false)
    private String action;
    private String resource;
    private String ip;
    @Column(nullable = false)
    private String type;
}
''')

write('entity/SystemSetting.java', '''
package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {
    @Id
    @Column(name = "setting_key", nullable = false)
    private String settingKey;
    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    private String settingValue;
}
''')

# REPOSITORIES
repos = ['VmHost', 'ApiKey', 'Alert', 'AlertRule', 'AuditLog']
for ent in repos:
    write(f'repository/{ent}Repository.java', f'''
package com.rpa.backend.repository;
import com.rpa.backend.entity.{ent};
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface {ent}Repository extends JpaRepository<{ent}, UUID> {{
}}
''')

write('repository/SystemSettingRepository.java', '''
package com.rpa.backend.repository;
import com.rpa.backend.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}
''')

# CONTROLLERS
write('controller/VmHostController.java', '''
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
    @GetMapping public List<VmHost> getAll() { return repo.findAll(); }
    @PostMapping public VmHost create(@RequestBody VmHost entity) { return repo.save(entity); }
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { repo.deleteById(id); }
}
''')

write('controller/ApiKeyController.java', '''
package com.rpa.backend.controller;
import com.rpa.backend.entity.ApiKey;
import com.rpa.backend.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.security.MessageDigest;
import java.util.Base64;

@RestController
@RequestMapping("/api/keys")
public class ApiKeyController {
    @Autowired private ApiKeyRepository repo;
    
    @GetMapping public List<ApiKey> getAll() { return repo.findAll(); }
    
    @PostMapping 
    public ApiKey create(@RequestBody ApiKey entity) { 
        String rawKey = UUID.randomUUID().toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes("UTF-8"));
            entity.setKeyHash(Base64.getEncoder().encodeToString(hash));
            entity.setKeyPrefix(rawKey.substring(0, 8));
        } catch(Exception e) {}
        ApiKey saved = repo.save(entity);
        saved.setRawKey(rawKey);
        return saved;
    }
    
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id) { repo.deleteById(id); }
}
''')

write('controller/AlertController.java', '''
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
    
    @GetMapping public List<Alert> getAlerts() { return alertRepo.findAll(); }
    @PostMapping("/{id}/acknowledge") public void ackAlert(@PathVariable UUID id) { 
        alertRepo.findById(id).ifPresent(a -> { a.setStatus("acknowledged"); alertRepo.save(a); });
    }
    
    @GetMapping("/rules") public List<AlertRule> getRules() { return ruleRepo.findAll(); }
    @PostMapping("/rules") public AlertRule createRule(@RequestBody AlertRule r) { return ruleRepo.save(r); }
    @PutMapping("/rules/{id}/toggle") public AlertRule toggleRule(@PathVariable UUID id) {
        return ruleRepo.findById(id).map(r -> { r.setEnabled(!r.getEnabled()); return ruleRepo.save(r); }).orElse(null);
    }
}
''')

write('controller/AccessController.java', '''
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
    
    @GetMapping("/users") public List<User> getUsers() { return userRepo.findAll(); }
    @PostMapping("/users") public User createUser(@RequestBody User u) { return userRepo.save(u); }
    
    @GetMapping("/roles") public List<Role> getRoles() { return roleRepo.findAll(); }
    @PostMapping("/roles") public Role createRole(@RequestBody Role r) { return roleRepo.save(r); }
    
    @PutMapping("/roles/{id}/permissions")
    public Role updateRolePermissions(@PathVariable UUID id, @RequestBody Set<String> permissions) {
        return roleRepo.findById(id).map(r -> { r.setPermissions(permissions); return roleRepo.save(r); }).orElse(null);
    }
}
''')

write('controller/AuditLogController.java', '''
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
    @GetMapping public List<AuditLog> getAll() { return repo.findAll(); }
}
''')

write('controller/SettingsController.java', '''
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
    @GetMapping public List<SystemSetting> getAll() { return repo.findAll(); }
    @PostMapping public SystemSetting create(@RequestBody SystemSetting s) { return repo.save(s); }
}
''')
