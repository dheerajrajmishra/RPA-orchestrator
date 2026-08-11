package com.rpa.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpa.entity.ProcessRegistry;
import com.rpa.entity.ProcessRun;
import com.rpa.entity.ProcessRunLog;
import com.rpa.entity.ProcessRunStep;
import com.rpa.repository.ProcessRegistryRepository;
import com.rpa.repository.ProcessRunLogRepository;
import com.rpa.repository.ProcessRunRepository;
import com.rpa.repository.ProcessRunStepRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/reporter/v1/runs")
public class RunController {

    private final ProcessRunRepository runRepository;
    private final ProcessRunStepRepository stepRepository;
    private final ProcessRunLogRepository logRepository;
    private final ProcessRegistryRepository registryRepository;
    private final ObjectMapper objectMapper;

    public RunController(ProcessRunRepository runRepository, 
                         ProcessRunStepRepository stepRepository,
                         ProcessRunLogRepository logRepository,
                         ProcessRegistryRepository registryRepository,
                         ObjectMapper objectMapper) {
        this.runRepository = runRepository;
        this.stepRepository = stepRepository;
        this.logRepository = logRepository;
        this.registryRepository = registryRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<ProcessRun> startRun(@RequestBody ProcessRun run) {
        if (run.getProcessId() == null) {
            String slug = (run.getProcessSlug() != null && !run.getProcessSlug().isBlank()) 
                    ? run.getProcessSlug() 
                    : "default-process";
            
            ProcessRegistry registry = registryRepository.findBySlug(slug).orElseGet(() -> {
                ProcessRegistry newReg = new ProcessRegistry();
                newReg.setName(slug);
                newReg.setSlug(slug);
                newReg.setScriptPath("/scripts/" + slug);
                newReg.setWorkerHost(run.getWorkerHost() != null ? run.getWorkerHost() : "localhost");
                return registryRepository.save(newReg);
            });
            run.setProcessId(registry.getId());
        }

        if (run.getWorkerHost() == null) {
            run.setWorkerHost("localhost");
        }

        run.setStatus("running");
        ProcessRun saved = runRepository.save(run);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{runId}")
    public ResponseEntity<ProcessRun> completeRun(@PathVariable UUID runId, @RequestBody ProcessRun update) {
        return runRepository.findById(runId).map(run -> {
            if (update.getStatus() != null) run.setStatus(update.getStatus());
            run.setCompletedAt(OffsetDateTime.now());
            if (update.getOutputSummary() != null) run.setOutputSummary(update.getOutputSummary());
            if (update.getErrorMessage() != null) run.setErrorMessage(update.getErrorMessage());
            if (update.getErrorTraceback() != null) run.setErrorTraceback(update.getErrorTraceback());
            if (update.getRecordsProcessed() != null) run.setRecordsProcessed(update.getRecordsProcessed());
            if (update.getRecordsFailed() != null) run.setRecordsFailed(update.getRecordsFailed());
            if (update.getErrorCategory() != null) run.setErrorCategory(update.getErrorCategory());
            return ResponseEntity.ok(runRepository.save(run));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{runId}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable UUID runId) {
        return runRepository.findById(runId).map(run -> {
            run.setHeartbeatAt(OffsetDateTime.now());
            runRepository.save(run);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{runId}/steps")
    public ResponseEntity<ProcessRunStep> reportStep(@PathVariable UUID runId, @RequestBody ProcessRunStep step) {
        step.setRunId(runId);
        if (step.getStatus() == null) step.setStatus("running");
        if (step.getStartedAt() == null) step.setStartedAt(OffsetDateTime.now());
        return ResponseEntity.ok(stepRepository.save(step));
    }

    @PatchMapping("/{runId}/steps/{stepId}")
    public ResponseEntity<ProcessRunStep> completeStep(@PathVariable UUID runId, @PathVariable UUID stepId, @RequestBody ProcessRunStep update) {
        return stepRepository.findById(stepId).map(step -> {
            if (update.getStatus() != null) step.setStatus(update.getStatus());
            step.setCompletedAt(OffsetDateTime.now());
            if (update.getDetails() != null) step.setDetails(update.getDetails());
            if (update.getErrorMessage() != null) step.setErrorMessage(update.getErrorMessage());
            return ResponseEntity.ok(stepRepository.save(step));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{runId}/logs")
    public ResponseEntity<ProcessRunLog> ingestLog(@PathVariable UUID runId, @RequestBody ProcessRunLog log) {
        log.setRunId(runId);
        return ResponseEntity.ok(logRepository.save(log));
    }

    @PostMapping("/{runId}/logs/batch")
    public ResponseEntity<Void> ingestLogsBatch(@PathVariable UUID runId, @RequestBody Object body) {
        List<ProcessRunLog> logList;
        if (body instanceof List) {
            logList = objectMapper.convertValue(body, new TypeReference<List<ProcessRunLog>>() {});
        } else if (body instanceof Map && ((Map<?, ?>) body).containsKey("logs")) {
            logList = objectMapper.convertValue(((Map<?, ?>) body).get("logs"), new TypeReference<List<ProcessRunLog>>() {});
        } else {
            logList = Collections.emptyList();
        }
        logList.forEach(log -> log.setRunId(runId));
        logRepository.saveAll(logList);
        return ResponseEntity.ok().build();
    }
}
