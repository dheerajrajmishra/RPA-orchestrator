# RPA Orchestrator — VM Deployment Guide

This guide provides step-by-step instructions for deploying the **Reporter API** on a central Server VM and setting up **Worker VMs** to report execution telemetry.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  SERVER VM                                        |
|  - PostgreSQL 14 Database (Port 5432)                                             |
|  - Reporter API Spring Boot Service (Port 8081)                                   |
|  - Firewall Inbound Rule: Allow 8081 from Worker VMs                              |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | HTTP / REST (X-API-Key)
           +-----------------------------+-----------------------------+
           |                                                           |
+---------------------------------------+   +---------------------------------------+
|              WORKER VM 1              |   |              WORKER VM 2              |
|  - Windows Task Scheduler / Cron      |   |  - Windows Task Scheduler / Cron      |
|  - Python RPA Script (InvoiceBot.py)  |   |  - Python RPA Script (PayrollBot.py)  |
|  - orchestrator_sdk                   |   |  - orchestrator_sdk                   |
+---------------------------------------+   +---------------------------------------+
```

---

## PART 1: Deploying Reporter API on Server VM

### Step 1: Build Production Executable JAR File
On your development machine (or CI/CD pipeline), package `reporter-api` into an executable `.jar` file:

```bash
cd reporter-api
mvn clean package -DskipTests
```
*Output artifact*: `reporter-api/target/reporter-api-0.0.1-SNAPSHOT.jar`

---

### Step 2: Provision Server VM Prerequisites
Ensure the Server VM has:
1. **Java 21 Runtime Environment**:
   - Verify: `java -version`
2. **PostgreSQL 14+ Database**:
   - Ensure the `rpa_orchestrator` database exists.
   - Run the initial schema migration script `database/V1__initial_schema.sql` if not automated by Flyway.

---

### Step 3: Copy Jar & Configuration to Server VM
Copy the generated `.jar` file to the Server VM directory (e.g. `/opt/rpa/reporter-api` on Linux or `C:\RPA\reporter-api` on Windows).

Create an `application-prod.properties` (or set environment variables):

```properties
spring.application.name=reporter-api
server.port=8081

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/rpa_orchestrator
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.flyway.enabled=false
```

---

### Step 4: Run as Background Service

#### Option A: Linux (Systemd Service)
Create a service file `/etc/systemd/system/reporter-api.service`:

```ini
[Unit]
Description=RPA Reporter API Ingest Service
After=network.target postgresql.service

[Service]
User=rpauser
WorkingDirectory=/opt/rpa/reporter-api
ExecStart=/usr/bin/java -jar /opt/rpa/reporter-api/reporter-api-0.0.1-SNAPSHOT.jar --spring.config.location=/opt/rpa/reporter-api/application-prod.properties
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable reporter-api
sudo systemctl start reporter-api
sudo systemctl status reporter-api
```

#### Option B: Windows Service (NSSM - Non-Sucking Service Manager)
Download NSSM and run in PowerShell (Administrator):
```powershell
nssm install ReporterAPI "C:\Program Files\Java\jdk-21\bin\java.exe" "-jar C:\RPA\reporter-api\reporter-api-0.0.1-SNAPSHOT.jar --spring.config.location=C:\RPA\reporter-api\application-prod.properties"
nssm set ReporterAPI AppDirectory "C:\RPA\reporter-api"
nssm start ReporterAPI
```

---

### Step 5: Configure Firewall Inbound Rule
Open port `8081` on Server VM firewall for Worker VM IP range:

- **Windows Firewall**:
  ```powershell
  New-NetFirewallRule -DisplayName "RPA Reporter API Inbound" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
  ```
- **Linux UFW**:
  ```bash
  sudo ufw allow 8081/tcp
  ```

---

## PART 2: Deploying RPA Bots on Worker VMs

### Step 1: Copy SDK to Worker VM
Copy `orchestrator_sdk` folder to the Worker VM, or install via pip:
```bash
pip install -e /path/to/orchestrator_sdk
```

---

### Step 2: Configure Bot Script Parameters
Inside your bot script (e.g. `C:\RPA\Bots\InvoiceBot.py`), update server URL and API Key:

```python
import os
from orchestrator_sdk import RunReporter

# Read environment variables or set defaults
API_BASE = os.getenv("ORCHESTRATOR_API_BASE", "http://192.168.1.50:8081") # Server VM IP
API_KEY = os.getenv("ORCHESTRATOR_API_KEY", "dev_key_12345")

reporter = RunReporter(
    api_base=API_BASE,
    process_slug="invoice-processor",
    api_key=API_KEY
)

def run():
    run_id = reporter.start_run(trigger="scheduled")
    try:
        with reporter.step("Download SAP Invoices") as step_id:
            reporter.log("Downloading files...", step_id=step_id)
            # Bot business logic...
        
        reporter.complete(success=True, records_processed=10)
    except Exception as e:
        reporter.complete(success=False, error=str(e))

if __name__ == "__main__":
    run()
```

---

### Step 3: Test Worker-to-Server Network Connectivity
From the Worker VM, run a health check:

- **PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri "http://192.168.1.50:8081/health"
  ```
- **cURL**:
  ```bash
  curl http://192.168.1.50:8081/health
  ```
Expected output: `{"status": "UP"}`

---

### Step 4: Schedule Bot Execution on Worker VM

#### Windows Task Scheduler Setup:
1. Open **Task Scheduler** (`taskschd.msc`).
2. Click **Create Basic Task** -> Name: `RPA_InvoiceBot`.
3. Set Trigger: **Daily / Hourly** (e.g. every hour).
4. Set Action: **Start a program**:
   - Program/script: `python.exe` (or `C:\Python311\python.exe`)
   - Arguments: `C:\RPA\Bots\InvoiceBot.py`
   - Start in: `C:\RPA\Bots\`
5. Under Security Options: Select **Run whether user is logged on or not** & check **Run with highest privileges**.

---

## Verification & Monitoring Checklist

- [ ] `http://<SERVER_VM_IP>:8081/health` returns `status: UP`.
- [ ] `http://<SERVER_VM_IP>:8081/swagger-ui/index.html` displays Swagger UI.
- [ ] Worker VM task scheduler triggers bot execution.
- [ ] Bot execution run appears live on the Next.js Dashboard.
