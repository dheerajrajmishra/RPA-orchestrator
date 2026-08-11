package com.rpa.repository;

import com.rpa.entity.ProcessRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProcessRunRepository extends JpaRepository<ProcessRun, UUID> {}
