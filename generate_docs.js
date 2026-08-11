const fs = require('fs');
const path = require('path');
const { 
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, 
    BorderStyle, WidthType, AlignmentType, ShadingType 
} = require('docx');

function createHeading(text, level) {
    return new Paragraph({
        heading: level,
        spacing: { before: 240, after: 120 },
        children: [
            new TextRun({
                text: text,
                bold: true,
                color: level === HeadingLevel.HEADING_1 ? "1E3A8A" : (level === HeadingLevel.HEADING_2 ? "0D9488" : "1E293B"),
                size: level === HeadingLevel.HEADING_1 ? 32 : (level === HeadingLevel.HEADING_2 ? 24 : 20),
                font: "Calibri"
            })
        ]
    });
}

function createParagraph(text, options = {}) {
    return new Paragraph({
        spacing: { before: 60, after: 120 },
        children: [
            new TextRun({
                text: text,
                bold: options.bold || false,
                italic: options.italic || false,
                color: options.color || "333333",
                size: 22, // 11pt
                font: "Calibri"
            })
        ]
    });
}

function createCodeBlock(codeText) {
    const lines = codeText.split('\n');
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { fill: "F8FAFC" },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                            left: { style: BorderStyle.SINGLE, size: 12, color: "0D9488" },
                            right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                        },
                        margins: { top: 100, bottom: 100, left: 150, right: 150 },
                        children: lines.map(line => new Paragraph({
                            spacing: { before: 20, after: 20 },
                            children: [
                                new TextRun({
                                    text: line,
                                    font: "Consolas",
                                    size: 18, // 9pt
                                    color: "0F172A"
                                })
                            ]
                        }))
                    })
                ]
            })
        ]
    });
}

function createEndpointTable(method, endpoint, desc, auth) {
    const isPost = method === "POST";
    const isPatch = method === "PATCH";
    const isGet = method === "GET";
    const methodColor = isPost ? "166534" : (isPatch ? "9A3412" : "1E40AF");
    const methodBg = isPost ? "DCFCE7" : (isPatch ? "FFEDD5" : "DBEAFE");

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        shading: { fill: methodBg },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
                        children: [new Paragraph({ children: [new TextRun({ text: method, bold: true, color: methodColor, font: "Consolas", size: 20 })] })]
                    }),
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        shading: { fill: "F1F5F9" },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
                        children: [new Paragraph({ children: [new TextRun({ text: endpoint, bold: true, font: "Consolas", size: 20, color: "0F172A" })] })]
                    }),
                    new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        shading: { fill: "F1F5F9" },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
                        children: [new Paragraph({ children: [new TextRun({ text: auth, italic: true, font: "Calibri", size: 18, color: "475569" })] })]
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        shading: { fill: "FFFFFF" },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
                        children: [new Paragraph({ children: [new TextRun({ text: desc, font: "Calibri", size: 20, color: "334155" })] })]
                    })
                ]
            })
        ]
    });
}

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            // Title
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({
                        text: "RPA Orchestrator Platform",
                        bold: true,
                        size: 44,
                        color: "1E3A8A",
                        font: "Calibri"
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 400 },
                children: [
                    new TextRun({
                        text: "Worker VM Process Flow & API Specifications Guide",
                        italic: true,
                        size: 26,
                        color: "0D9488",
                        font: "Calibri"
                    })
                ]
            }),

            // Section 1: Overview & Process Flow Diagram
            createHeading("1. Worker VM Execution Process Flow & Workflow", HeadingLevel.HEADING_1),
            createParagraph("This section details the end-to-end operational workflow of an RPA bot running on a worker VM, showing how each API call is triggered throughout the process lifecycle."),
            
            createHeading("1.1 Multi-VM Deployment Architecture", HeadingLevel.HEADING_2),
            createParagraph("Each worker VM operates independently. Scheduling is managed locally on each VM via OS Task Scheduler or cron. When a scheduled task fires, the RPA script executes and communicates with the centralized Reporter API:"),
            
            createCodeBlock(
`+-----------------------------------------------------------------------------------+
|                                  WORKER VM 1                                      |
|  [Windows Task Scheduler] ---> [Python Script (InvoiceBot.py)]                   |
|                                       |                                           |
+---------------------------------------|-------------------------------------------+
                                        | (HTTP X-API-Key: dev_key_12345)
                                        v
+-----------------------------------------------------------------------------------+
|                            RPA ORCHESTRATOR SERVER                                 |
|                                                                                   |
|   Reporter API (Port 8081)  =====>  PostgreSQL DB  =====>  Next.js Dashboard UI   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                        ^
                                        | (HTTP X-API-Key: dev_key_12345)
+---------------------------------------|-------------------------------------------+
|  [Windows Task Scheduler] ---> [Python Script (PayrollBot.py)]                   |
|                                  WORKER VM 2                                      |
+-----------------------------------------------------------------------------------+`
            ),

            createHeading("1.2 Step-by-Step VM Process Execution Sequence", HeadingLevel.HEADING_2),
            createParagraph("Below is the exact chronological sequence of API calls executed during an RPA bot run:"),

            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Step 1: Process Start (Run Registration)\n", bold: true, color: "1E3A8A" }),
                    new TextRun({ text: "The script initializes the RunReporter SDK and calls POST /reporter/v1/runs. The Reporter API checks if processSlug exists. If missing, it automatically creates a process entry. Returns a unique runId (UUID)." })
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Step 2: Execution Step Initialization\n", bold: true, color: "1E3A8A" }),
                    new TextRun({ text: "Before starting a logical operation (e.g. 'Download SAP Reports'), the bot calls POST /reporter/v1/runs/{runId}/steps. Returns a unique stepId (UUID)." })
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Step 3: Log Ingestion & Heartbeat\n", bold: true, color: "1E3A8A" }),
                    new TextRun({ text: "During step execution, logs are sent via POST /reporter/v1/runs/{runId}/logs or batch POST /reporter/v1/runs/{runId}/logs/batch. Simultaneously, POST /reporter/v1/runs/{runId}/heartbeat is called automatically every 60 seconds." })
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Step 4: Execution Step Completion\n", bold: true, color: "1E3A8A" }),
                    new TextRun({ text: "Upon step completion, the bot calls PATCH /reporter/v1/runs/{runId}/steps/{stepId} with status 'success' or 'failed', duration, and record counts." })
                ]
            }),
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({ text: "Step 5: Run Finalization\n", bold: true, color: "1E3A8A" }),
                    new TextRun({ text: "When all steps complete (or upon uncaught exception), the script calls PATCH /reporter/v1/runs/{runId} to set run status to 'success' or 'failed', record count summary, or error traceback." })
                ]
            }),

            createHeading("1.3 Code-to-API Mapping Matrix", HeadingLevel.HEADING_2),
            createParagraph("The table below maps Python SDK statements directly to the API endpoints executed over the wire:"),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Python SDK Call", bold: true, color: "FFFFFF", font: "Calibri", size: 20 })] })] }),
                            new TableCell({ shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "HTTP API Endpoint Called", bold: true, color: "FFFFFF", font: "Calibri", size: 20 })] })] }),
                            new TableCell({ shading: { fill: "1E3A8A" }, children: [new Paragraph({ children: [new TextRun({ text: "Action & Result", bold: true, color: "FFFFFF", font: "Calibri", size: 20 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "reporter.start_run()", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "POST /reporter/v1/runs", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Creates run record; returns runId", font: "Calibri", size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "with reporter.step('Name'):", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "POST /reporter/v1/runs/{runId}/steps", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Starts step; returns stepId", font: "Calibri", size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "reporter.log('msg')", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "POST /reporter/v1/runs/{runId}/logs", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Appends log line under current run/step", font: "Calibri", size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "reporter.heartbeat()", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "POST /reporter/v1/runs/{runId}/heartbeat", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Updates heartbeat timestamp", font: "Calibri", size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "step context manager exit", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PATCH /reporter/v1/runs/{runId}/steps/{stepId}", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Marks step status success or failed", font: "Calibri", size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "reporter.complete()", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PATCH /reporter/v1/runs/{runId}", font: "Consolas", size: 18 })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Finalizes run status, counts & tracebacks", font: "Calibri", size: 18 })] })] }),
                        ]
                    })
                ]
            }),

            // Section 2: Detailed Endpoints
            createHeading("2. Reporter API Request & Response Specifications", HeadingLevel.HEADING_1),

            // Endpoint 1: Health Check
            createHeading("2.1 GET /health — Service Health Check", HeadingLevel.HEADING_2),
            createEndpointTable("GET", "/health", "Verifies whether the Reporter API ingest service is active.", "Authentication: None"),
            createParagraph("Request Headers: None", { bold: true }),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body:"),
            createCodeBlock(`{\n  "status": "UP"\n}`),

            // Endpoint 2: Start Run
            createHeading("2.2 POST /reporter/v1/runs — Start Process Run", HeadingLevel.HEADING_2),
            createEndpointTable("POST", "/reporter/v1/runs", "Initializes a new execution run. If processSlug is not registered in DB, it auto-registers a process entry.", "Header: X-API-Key"),
            createParagraph("Request Headers:", { bold: true }),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body Payload:"),
            createCodeBlock(`{\n  "processSlug": "invoice-processor",\n  "trigger": "scheduled",\n  "workerHost": "VM-WORKER-01",\n  "workerPid": 14208,\n  "attemptNumber": 1,\n  "parentRunId": null,\n  "inputParams": {\n    "batchId": "BATCH-2026-0811",\n    "targetFolder": "C:\\\\Invoices"\n  }\n}`),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body JSON:"),
            createCodeBlock(`{\n  "id": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "runId": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "processId": "aa63794d-51d5-4f55-81ad-9fa3714d72f5",\n  "processSlug": "invoice-processor",\n  "trigger": "scheduled",\n  "status": "running",\n  "startedAt": "2026-08-11T11:43:25.281+05:30",\n  "completedAt": null,\n  "durationMs": null,\n  "heartbeatAt": "2026-08-11T11:43:25.281+05:30",\n  "workerHost": "VM-WORKER-01",\n  "workerPid": 14208,\n  "attemptNumber": 1,\n  "parentRunId": null,\n  "inputParams": "{\\"batchId\\":\\"BATCH-2026-0811\\",\\"targetFolder\\":\\"C:\\\\\\\\Invoices\\"}",\n  "outputSummary": null,\n  "recordsProcessed": 0,\n  "recordsFailed": 0,\n  "errorMessage": null,\n  "errorTraceback": null,\n  "errorCategory": null,\n  "createdAt": "2026-08-11T11:43:25.281+05:30"\n}`),

            // Endpoint 3: Complete Run
            createHeading("2.3 PATCH /reporter/v1/runs/{runId} — Complete Process Run", HeadingLevel.HEADING_2),
            createEndpointTable("PATCH", "/reporter/v1/runs/{runId}", "Finalizes process run execution. Sets status to success, failed, timeout, or cancelled.", "Header: X-API-Key"),
            createParagraph("Path Parameter: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34"),
            createParagraph("Request Headers:"),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body (Success Scenario):"),
            createCodeBlock(`{\n  "status": "success",\n  "recordsProcessed": 150,\n  "recordsFailed": 2,\n  "outputSummary": {\n    "reportUrl": "https://storage.local/reports/batch-123.pdf",\n    "totalAmount": 45200.50\n  }\n}`),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body JSON:"),
            createCodeBlock(`{\n  "id": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "runId": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "processId": "aa63794d-51d5-4f55-81ad-9fa3714d72f5",\n  "status": "success",\n  "startedAt": "2026-08-11T11:43:25.281+05:30",\n  "completedAt": "2026-08-11T11:48:10.150+05:30",\n  "durationMs": 284869,\n  "heartbeatAt": "2026-08-11T11:48:10.150+05:30",\n  "workerHost": "VM-WORKER-01",\n  "recordsProcessed": 150,\n  "recordsFailed": 2,\n  "outputSummary": "{\\"reportUrl\\":\\"https://storage.local/reports/batch-123.pdf\\",\\"totalAmount\\":45200.5}"\n}`),

            createParagraph("Request Body (Failure Scenario):"),
            createCodeBlock(`{\n  "status": "failed",\n  "recordsProcessed": 45,\n  "recordsFailed": 10,\n  "errorMessage": "Element #submit-btn not clickable after 30s",\n  "errorTraceback": "Traceback (most recent call last):\\n  File \\"script.py\\", line 42\\nElementNotInteractableException",\n  "errorCategory": "ui_timeout"\n}`),

            // Endpoint 4: Heartbeat
            createHeading("2.4 POST /reporter/v1/runs/{runId}/heartbeat — Heartbeat Ping", HeadingLevel.HEADING_2),
            createEndpointTable("POST", "/reporter/v1/runs/{runId}/heartbeat", "Pings the orchestrator to keep run status active.", "Header: X-API-Key"),
            createParagraph("Path Parameter: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34"),
            createParagraph("Request Headers: X-API-Key: dev_key_12345"),
            createParagraph("Request Body: None / Empty {}"),
            createParagraph("Response Status: 200 OK (Empty response body)", { bold: true, color: "166534" }),

            // Endpoint 5: Start Step
            createHeading("2.5 POST /reporter/v1/runs/{runId}/steps — Start Execution Step", HeadingLevel.HEADING_2),
            createEndpointTable("POST", "/reporter/v1/runs/{runId}/steps", "Reports execution start for a specific process step.", "Header: X-API-Key"),
            createParagraph("Path Parameter: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34"),
            createParagraph("Request Headers:"),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body Payload:"),
            createCodeBlock(`{\n  "stepName": "Download SAP Invoices",\n  "stepOrder": 1,\n  "status": "running"\n}`),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body JSON:"),
            createCodeBlock(`{\n  "id": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "runId": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "stepName": "Download SAP Invoices",\n  "stepOrder": 1,\n  "status": "running",\n  "startedAt": "2026-08-11T11:44:00.000+05:30",\n  "completedAt": null,\n  "durationMs": null,\n  "recordsIn": 0,\n  "recordsOut": 0,\n  "details": null,\n  "errorMessage": null,\n  "createdAt": "2026-08-11T11:44:00.000+05:30"\n}`),

            // Endpoint 6: Complete Step
            createHeading("2.6 PATCH /reporter/v1/runs/{runId}/steps/{stepId} — Complete Execution Step", HeadingLevel.HEADING_2),
            createEndpointTable("PATCH", "/reporter/v1/runs/{runId}/steps/{stepId}", "Marks an individual step as success or failed.", "Header: X-API-Key"),
            createParagraph("Path Parameters: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34, stepId = e83f2a1b-4491-4c91-a1e2-048719283fbb"),
            createParagraph("Request Headers:"),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body Payload:"),
            createCodeBlock(`{\n  "status": "success",\n  "recordsIn": 25,\n  "recordsOut": 25,\n  "details": {\n    "filesDownloadedCount": 25,\n    "downloadDurationMs": 1420\n  }\n}`),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body JSON:"),
            createCodeBlock(`{\n  "id": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "runId": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "stepName": "Download SAP Invoices",\n  "stepOrder": 1,\n  "status": "success",\n  "startedAt": "2026-08-11T11:44:00.000+05:30",\n  "completedAt": "2026-08-11T11:44:02.150+05:30",\n  "durationMs": 2150,\n  "recordsIn": 25,\n  "recordsOut": 25,\n  "details": "{\\"filesDownloadedCount\\":25,\\"downloadDurationMs\\":1420}"\n}`),

            // Endpoint 7: Single Log Ingestion
            createHeading("2.7 POST /reporter/v1/runs/{runId}/logs — Ingest Single Log", HeadingLevel.HEADING_2),
            createEndpointTable("POST", "/reporter/v1/runs/{runId}/logs", "Appends a single structured log line.", "Header: X-API-Key"),
            createParagraph("Path Parameter: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34"),
            createParagraph("Request Headers:"),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body Payload:"),
            createCodeBlock(`{\n  "logLevel": "INFO",\n  "message": "Successfully authenticated to SAP portal",\n  "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "context": {\n    "sessionToken": "SESS_99410A",\n    "loginLatencyMs": 340\n  }\n}`),
            createParagraph("Response Status: 200 OK", { bold: true, color: "166534" }),
            createParagraph("Response Body JSON:"),
            createCodeBlock(`{\n  "id": 10045,\n  "runId": "9b0a5bdd-cabc-4379-98fe-fe2993aaef34",\n  "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb",\n  "logLevel": "INFO",\n  "message": "Successfully authenticated to SAP portal",\n  "context": "{\\"sessionToken\\":\\"SESS_99410A\\",\\"loginLatencyMs\\":340}",\n  "createdAt": "2026-08-11T11:44:01.050+05:30"\n}`),

            // Endpoint 8: Batch Log Ingestion
            createHeading("2.8 POST /reporter/v1/runs/{runId}/logs/batch — Ingest Batch Logs", HeadingLevel.HEADING_2),
            createEndpointTable("POST", "/reporter/v1/runs/{runId}/logs/batch", "Appends multiple log lines in a single network call. Supports both wrapper object and raw array formats.", "Header: X-API-Key"),
            createParagraph("Path Parameter: runId = 9b0a5bdd-cabc-4379-98fe-fe2993aaef34"),
            createParagraph("Request Headers:"),
            createCodeBlock("X-API-Key: dev_key_12345\nContent-Type: application/json"),
            createParagraph("Request Body Payload (Option 1 - Object with logs key):"),
            createCodeBlock(`{\n  "logs": [\n    {\n      "logLevel": "INFO",\n      "message": "Processing invoice #INV-1001",\n      "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb"\n    },\n    {\n      "logLevel": "WARN",\n      "message": "Invoice #INV-1002 has missing discount code",\n      "stepId": "e83f2a1b-4491-4c91-a1e2-048719283fbb"\n    }\n  ]\n}`),
            createParagraph("Request Body Payload (Option 2 - Raw JSON Array):"),
            createCodeBlock(`[\n  {\n    "logLevel": "INFO",\n    "message": "Processing invoice #INV-1001"\n  },\n  {\n    "logLevel": "WARN",\n    "message": "Invoice #INV-1002 has missing discount code"\n  }\n]`),
            createParagraph("Response Status: 200 OK (Empty response body)", { bold: true, color: "166534" })

        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    let docxPath = path.join(__dirname, "RPA_Orchestrator_API_Specifications.docx");
    try {
        fs.writeFileSync(docxPath, buffer);
        console.log("Successfully updated DOCX file at: " + docxPath);
    } catch (e) {
        docxPath = path.join(__dirname, "RPA_Reporter_API_Specifications_Full.docx");
        fs.writeFileSync(docxPath, buffer);
        console.log("Primary DOCX locked by user. Created updated DOCX file at: " + docxPath);
    }
});
