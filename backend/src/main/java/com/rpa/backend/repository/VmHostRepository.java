package com.rpa.backend.repository;
import com.rpa.backend.entity.VmHost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface VmHostRepository extends JpaRepository<VmHost, UUID> {
}
