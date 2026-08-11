package com.rpa.repository;

import com.rpa.entity.ProcessRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProcessRegistryRepository extends JpaRepository<ProcessRegistry, UUID> {
    Optional<ProcessRegistry> findBySlug(String slug);
}
