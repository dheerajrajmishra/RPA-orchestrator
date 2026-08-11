package com.rpa.repository;

import com.rpa.entity.ProcessRunStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProcessRunStepRepository extends JpaRepository<ProcessRunStep, UUID> {}
