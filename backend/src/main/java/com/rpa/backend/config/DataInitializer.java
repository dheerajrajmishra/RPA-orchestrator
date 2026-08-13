package com.rpa.backend.config;

import com.rpa.backend.entity.Category;
import com.rpa.backend.entity.Role;
import com.rpa.backend.entity.User;
import com.rpa.backend.repository.CategoryRepository;
import com.rpa.backend.repository.RoleRepository;
import com.rpa.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Role adminRole = roleRepository.findByName("Admin").orElseGet(() -> {
            Role role = new Role();
            role.setName("Admin");
            role.setDescription("System Administrator with full access");
            role.setIsSystem(true);
            role.setPermissions(Set.of(
                    "proc:read", "proc:write", "proc:exec",
                    "sys:hosts", "sys:keys", "sys:alerts",
                    "admin:users", "admin:roles", "admin:settings"
            ));
            return roleRepository.save(role);
        });

        roleRepository.findByName("Operator").orElseGet(() -> {
            Role role = new Role();
            role.setName("Operator");
            role.setDescription("Process execution and host monitoring");
            role.setIsSystem(false);
            role.setPermissions(Set.of("proc:read", "proc:exec", "sys:hosts"));
            return roleRepository.save(role);
        });

        roleRepository.findByName("Viewer").orElseGet(() -> {
            Role role = new Role();
            role.setName("Viewer");
            role.setDescription("Read-only access to dashboard and logs");
            role.setIsSystem(false);
            role.setPermissions(Set.of("proc:read"));
            return roleRepository.save(role);
        });

        if (userRepository.count() == 0) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@company.com");
            adminUser.setDisplayName("System Administrator");
            adminUser.setPasswordHash(passwordEncoder.encode("password"));
            adminUser.setRole(adminRole);
            adminUser.setIsActive(true);
            userRepository.save(adminUser);
        }

        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = List.of(
                    createCategory("Finance", "Financial & Invoice Automation", "#8b5cf6"),
                    createCategory("HR", "Human Resources & Onboarding", "#ec4899"),
                    createCategory("Procurement", "Vendor & PO Processing", "#f97316"),
                    createCategory("IT", "Infrastructure & Monitoring", "#06b6d4")
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }

    private Category createCategory(String name, String desc, String color) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        c.setColor(color);
        return c;
    }
}
