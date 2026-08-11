# Multi-Container Docker Deployment Guide for Windows Server VM

This guide provides step-by-step instructions to deploy the entire RPA Orchestrator system (`postgres`, `backend`, `reporter-api`, and `frontend`) on a **Windows Server VM** using Docker and Docker Compose.

---

## Step 1: Prerequisites Installation on Windows Server VM

Open **PowerShell as Administrator** on your Windows Server VM:

### 1.1 Enable Windows Containers & Hyper-V Features
```powershell
# Enable WSL2 & VirtualMachinePlatform features
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
```
*(Restart the VM if prompted).*

### 1.2 Install Docker Desktop / Docker Engine for Windows
- Download and run [Docker Desktop for Windows Installer](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe).
- Ensure **"Use WSL 2 instead of Hyper-V"** is checked during installation.
- Launch Docker Desktop and wait until status turns **Green / Running**.

### 1.3 Install Git for Windows
- Download & install [Git for Windows](https://git-scm.com/download/win).

---

## Step 2: Clone GitHub Repository on Windows Server VM

Open **PowerShell** and navigate to your deployment directory (e.g. `C:\RPA`):

```powershell
# Create deployment directory
New-Item -ItemType Directory -Force -Path "C:\RPA"
Set-Location -Path "C:\RPA"

# Clone the repository
git clone https://github.com/dheerajrajmishra/RPA-orchestrator.git
Set-Location -Path "C:\RPA\RPA-orchestrator"
```

---

## Step 3: Build & Launch Multi-Container Setup

Run the following command to build images and launch all 4 services in the background:

```powershell
# Launch all containers in detached mode
docker compose up --build -d
```

### Docker Output Expectation:
```
[+] Building 4/4
 -> [postgres] Pulling image postgres:16-alpine
 -> [backend] Building Spring Boot Core API Image...
 -> [reporter-api] Building Spring Boot Ingest API Image...
 -> [frontend] Building Next.js 14 Dashboard UI Image...
[+] Running 4/4
 ✔ Container rpa-postgres      Healthy
 ✔ Container rpa-backend       Started
 ✔ Container rpa-reporter-api  Started
 ✔ Container rpa-frontend      Started
```

---

## Step 4: Verify Container Health & Endpoints

### 4.1 Check Container Statuses
```powershell
docker compose ps
```

### 4.2 Check Application Endpoints via PowerShell
```powershell
# 1. Frontend Dashboard (Port 3000)
(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing).StatusCode
# Output: 200

# 2. Core Backend API (Port 8080)
(Invoke-WebRequest -Uri http://localhost:8080/api/hosts -UseBasicParsing).StatusCode
# Output: 200

# 3. Reporter Ingest API Health (Port 8081)
(Invoke-WebRequest -Uri http://localhost:8081/health -UseBasicParsing).StatusCode
# Output: 200
```

---

## Step 5: Configure Windows Firewall

To allow user browsers and worker VMs to access the Orchestrator over the company network:

```powershell
# Run in PowerShell as Administrator

# Allow Inbound Traffic for Frontend UI (Port 3000)
New-NetFirewallRule -DisplayName "RPA Orchestrator Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Allow Inbound Traffic for Core Backend API (Port 8080)
New-NetFirewallRule -DisplayName "RPA Orchestrator Backend API" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# Allow Inbound Traffic for Reporter Ingest API (Port 8081)
New-NetFirewallRule -DisplayName "RPA Orchestrator Reporter API" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

---

## Step 6: Worker VM Configuration (RPA Bots)

On each Execution Worker VM (e.g. `VM-FIN-01`), configure your Python bot scripts to send heartbeats and execution logs:

```python
from orchestrator_sdk.reporter import RunReporter

# Replace SERVER_VM_IP with your Orchestrator Server VM IP address
reporter = RunReporter(
    api_url="http://SERVER_VM_IP:8081",
    api_key="rpa_b913ad1497ed426ebc1aed66701af4f3"
)

# Start execution run
run_id = reporter.start_run(process_slug="invoice-processing")

# Log execution progress
reporter.log("Extracting invoices from Outlook...", level="INFO")
reporter.log_step("Read Email Attachments", status="SUCCESS")

# Complete execution
reporter.complete_run(status="SUCCESS")
```

---

## Useful Maintenance Commands

```powershell
# View Live Logs across all containers
docker compose logs -f

# View Logs for a specific container
docker compose logs -f backend
docker compose logs -f reporter-api
docker compose logs -f frontend

# Restart all containers
docker compose restart

# Stop all containers
docker compose down

# Stop all containers AND clear database volume (Clean Reset)
docker compose down -v
```
