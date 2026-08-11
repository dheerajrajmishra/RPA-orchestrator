# RPA Orchestrator Platform — Windows VM Enterprise Architecture & Deployment Guide

This document outlines the recommended production architecture, security design, reverse proxy setup, Windows Service management, and network topology for deploying the **RPA Orchestrator Platform** on **Windows Server VMs**.

---

## 1. System Architecture Overview

The system consists of two primary environments:
1. **Central Management Server VM (`Server VM`)**: Hosts the Central Orchestrator, Storage, APIs, and Web Dashboard.
2. **Execution Worker VMs (`Worker VMs`)**: Host Windows RPA automation bots (Python, UIPath, BluePrism, Power Automate, AutoIt) that report execution status back to the Orchestrator via `Reporter API`.

```
                      +-------------------------------------------------------------+
                      |                      USER BROWSERS                          |
                      |            http://orchestrator.company.local                |
                      +------------------------------+------------------------------+
                                                     | HTTPS (Port 443)
                                                     v
+---------------------------------------------------------------------------------------------------+
| CENTRAL ORCHESTRATOR SERVER VM (Windows Server 2019/2022)                                        |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Reverse Proxy / SSL Termination (IIS + ARR / NGINX for Windows)                            |  |
|  | Listening on Port 80 / 443                                                                 |  |
|  +----+--------------------------------+--------------------------------+----------------------+  |
|       | / (Frontend UI)                | /api/ (Dashboard Backend API)  | /reporter/ (Ingest)  |
|       v                                v                                v                     |
|  +------------------------+   +------------------------+   +------------------------+         |
|  | Next.js Frontend UI    |   | Spring Boot Backend    |   | Spring Boot Reporter   |         |
|  | Port 3000 (Node.js)    |   | Port 8080 (Java 21)    |   | Port 8081 (Java 21)    |         |
|  | Windows Service (NSSM) |   | Windows Service (NSSM) |   | Windows Service (NSSM) |         |
|  +------------------------+   +-----------+------------+   +-----------+------------+         |
|                                           |                        |                          |
|                                           +-----------+------------+                          |
|                                                       |                                       |
|                                                       v                                       |
|                                       +-------------------------------+                       |
|                                       | PostgreSQL Database           |                       |
|                                       | Port 5432 (Shared Schema)     |                       |
|                                       +-------------------------------+                       |
+---------------------------------------------------------------------------------------------------+
                                                        ^
                                                        | HTTPS (Port 443) or HTTP (Port 8081)
                                                        | X-API-Key Authorization
     +--------------------------------------------------+--------------------------------------------------+
     |                                                  |                                                  |
     v                                                  v                                                  v
+-----------------------------+            +-----------------------------+            +-----------------------------+
| WORKER VM #1                |            | WORKER VM #2                |            | WORKER VM #N                |
| Hostname: VM-FIN-01         |            | Hostname: VM-HR-01          |            | Hostname: VM-PROC-01        |
| Role: Finance Automation    |            | Role: HR Payroll Automation |            | Role: Invoice Automation    |
| Python SDK / Reporter Agent |            | Python SDK / Reporter Agent |            | Python SDK / Reporter Agent |
+-----------------------------+            +-----------------------------+            +-----------------------------+
```

---

## 2. Recommended Windows VM Specs

| Role | OS Version | CPU | RAM | Disk | Purpose |
|---|---|---|---|---|---|
| **Central Orchestrator Server VM** | Windows Server 2019 / 2022 | 8 vCPU | 16 GB | 100 GB SSD | Web Dashboard, Backend APIs, PostgreSQL, NGINX |
| **Execution Worker VMs** | Windows 10/11 Enterprise or Windows Server | 4 vCPU | 8 GB | 60 GB SSD | Unattended RPA Bot Execution & Python SDK |

---

## 3. Deployment Architecture Details

### Tier 1: Reverse Proxy & SSL Termination (IIS or NGINX)
Instead of exposing Java ports (8080, 8081) and Next.js port (3000) directly to users and worker VMs, route all incoming traffic through **IIS (Internet Information Services)** with Application Request Routing (ARR) or **NGINX for Windows** on Port 443 (HTTPS).

#### NGINX Routing Configuration (`C:\nginx\conf\nginx.conf`):
```nginx
server {
    listen 80;
    server_name orchestrator.company.local;

    # 1. Frontend Web Dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Core Dashboard Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Bot Reporter Ingest API
    location /reporter/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Tier 2: Automatic Windows Services Management (NSSM)

To ensure applications run continuously in the background and auto-restart on VM reboot or failure, configure each component as a **Windows Service** using **NSSM (Non-Sucking Service Manager)**.

#### A. Backend Service Setup (`rpa-backend`)
```powershell
# Download nssm.exe and install Backend Service
nssm.exe install rpa-backend "C:\Program Files\Java\jdk-21\bin\java.exe" "-jar C:\rpa-orchestrator\backend\target\backend-0.0.1-SNAPSHOT.jar"
nssm.exe set rpa-backend AppDirectory "C:\rpa-orchestrator\backend"
nssm.exe set rpa-backend Start SERVICE_AUTO_START
nssm.exe start rpa-backend
```

#### B. Reporter API Service Setup (`rpa-reporter-api`)
```powershell
nssm.exe install rpa-reporter-api "C:\Program Files\Java\jdk-21\bin\java.exe" "-jar C:\rpa-orchestrator\reporter-api\target\reporter-api-0.0.1-SNAPSHOT.jar"
nssm.exe set rpa-reporter-api AppDirectory "C:\rpa-orchestrator\reporter-api"
nssm.exe set rpa-reporter-api Start SERVICE_AUTO_START
nssm.exe start rpa-reporter-api
```

#### C. Next.js Frontend Dashboard Service Setup (`rpa-frontend`)
```powershell
nssm.exe install rpa-frontend "C:\Program Files\nodejs\node.exe" "C:\rpa-orchestrator\frontend\node_modules\next\dist\bin\next start"
nssm.exe set rpa-frontend AppDirectory "C:\rpa-orchestrator\frontend"
nssm.exe set rpa-frontend Start SERVICE_AUTO_START
nssm.exe start rpa-frontend
```

---

### Tier 3: Database & Persistence Layer (PostgreSQL)

Install PostgreSQL 14/15/16 on Windows Server:
1. **Connection URL**: `jdbc:postgresql://localhost:5432/rpa_orchestrator`
2. **Windows Service**: Installed automatically as `postgresql-x64-16`.
3. **Backup Strategy**: Configure a daily scheduled Task in Windows Task Scheduler:
   ```powershell
   pg_dump.exe -U postgres -d rpa_orchestrator -F c -b -v -f "C:\Backups\rpa_db_$(Get-Date -Format 'yyyyMMdd').backup"
   ```

---

## 4. Worker VM Communication Architecture

Worker VMs running RPA bots execute processes and communicate status updates back to the Orchestrator via the Python SDK (`RunReporter`).

```
+-------------------------------------------------------------------------------+
| WORKER VM (e.g. VM-FIN-01)                                                    |
|                                                                               |
|  1. Bot Initiates Task                                                        |
|     reporter = RunReporter(api_url="http://orchestrator:8081",                |
|                            api_key="rpa_b913ad1497ed...")                     |
|                                                                               |
|  2. Step Execution & Logging                                                  |
|     reporter.start_run(process_slug="invoice-processor")                     |
|     reporter.log("Processing invoice #10024...")                              |
|     reporter.complete_run()                                                   |
+-------------------------------------------------------------------------------+
```

---

## 5. Security & Firewall Rules (Windows Firewall)

Configure inbound rules on the Central Server VM:

| Port | Protocol | Allowed Source | Description |
|---|---|---|---|
| **80 / 443** | TCP | Domain Users & Worker VMs | HTTP / HTTPS Web Dashboard & Reporter APIs |
| **5432** | TCP | Localhost (127.0.0.1) | PostgreSQL Database Access |
| **3389** | TCP | IT Admin Subnet | RDP Administration |

---

## 6. High Availability & Scalability Summary

1. **Service Auto-Recovery**: NSSM automatically restarts services if a process crashes.
2. **Database Resilience**: PostgreSQL connection pool managed by HikariCP.
3. **Stateless APIs**: Spring Boot applications are stateless, allowing multi-instance load balancing behind NGINX if traffic grows.
