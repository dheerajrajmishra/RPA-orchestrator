package com.rpa.backend.repository;
import com.rpa.backend.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {
}
