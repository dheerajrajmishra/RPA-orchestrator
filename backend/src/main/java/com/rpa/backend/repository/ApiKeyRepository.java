package com.rpa.backend.repository;
import com.rpa.backend.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
}
