# Multi-Container Docker Deployment Guide for Windows Server VM

This guide provides step-by-step instructions to deploy the entire RPA Orchestrator system (`postgres`, `backend`, `reporter-api`, and `frontend`) on a **Windows Server VM** using Docker and Docker Compose (Online or Offline Air-Gapped).

---

## Deployment Options
- **Option A: Online Deployment (With GitHub Access)** — See Sections 1 to 4.
- **Option B: Offline / Air-Gapped Deployment (Without GitHub / Internet Access)** — See Section 5.

---

## 1. Prerequisites Installation on Windows Server VM

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

---

## 2. Option A: Online Deployment (With GitHub)

```powershell
# Create deployment directory
New-Item -ItemType Directory -Force -Path "C:\RPA"
Set-Location -Path "C:\RPA"

# Clone the repository
git clone https://github.com/dheerajrajmishra/RPA-orchestrator.git
Set-Location -Path "C:\RPA\RPA-orchestrator"

# Launch containers
docker compose up --build -d
```

---

## 3. Option B: Offline / Air-Gapped Deployment (Without GitHub / Internet)

If your Windows Server VM does **not** have internet or GitHub access, follow one of these 2 methods:

### Method 1: Local Folder Transfer (ZIP Copy)
1. On your developer machine, compress the project folder into `RPA-orchestrator.zip`.
2. Transfer `RPA-orchestrator.zip` to the VM using **RDP Copy-Paste**, **Shared Network Drive (SMB)**, or **USB Drive**.
3. Extract `RPA-orchestrator.zip` on the VM to `C:\RPA\RPA-orchestrator`.
4. Open **PowerShell** on the VM and execute:
   ```powershell
   Set-Location -Path "C:\RPA\RPA-orchestrator"
   docker compose up --build -d
   ```

### Method 2: Pre-Built Offline Docker Images Tarball (Recommended for 100% Offline VMs)
If Maven/npm dependencies cannot be downloaded on the VM during container build:

#### Step 3.1: On Developer Machine (With Internet Access):
```powershell
# 1. Build container images
docker compose build

# 2. Package all 4 built images into a single offline tarball archive
docker save -o rpa-images.tar postgres:16-alpine rpa-backend rpa-reporter-api rpa-frontend
```

#### Step 3.2: Transfer Files to VM:
Copy `rpa-images.tar` and `docker-compose.yml` to `C:\RPA` on the Windows Server VM.

#### Step 3.3: On Air-Gapped Windows Server VM (No Internet / GitHub Needed):
Open **PowerShell** on the VM:
```powershell
Set-Location -Path "C:\RPA"

# 1. Load pre-built images directly into Docker Engine
docker load -i rpa-images.tar

# 2. Launch all 4 containers instantly without building or internet!
docker compose up -d
```

---

## 4. Verify Container Health & Endpoints

```powershell
# Check container statuses
docker compose ps

# Check endpoints via PowerShell
(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing).StatusCode    # 200 OK (Frontend)
(Invoke-WebRequest -Uri http://localhost:8080/api/hosts -UseBasicParsing).StatusCode # 200 OK (Backend API)
(Invoke-WebRequest -Uri http://localhost:8081/health -UseBasicParsing).StatusCode  # 200 OK (Reporter API)
```

---

## 5. Configure Windows Firewall Rules

```powershell
# Run in PowerShell as Administrator on Server VM
New-NetFirewallRule -DisplayName "RPA Orchestrator Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RPA Orchestrator Backend API" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RPA Orchestrator Reporter API" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

---

## 6. Worker VM Integration (RPA Bots)

On each Execution Worker VM (e.g. `VM-FIN-01`), configure Python scripts:

```python
from orchestrator_sdk.reporter import RunReporter

reporter = RunReporter(
    api_url="http://SERVER_VM_IP:8081",
    api_key="rpa_b913ad1497ed426ebc1aed66701af4f3"
)

# Start run & report step progress
run_id = reporter.start_run(process_slug="invoice-processing")
reporter.log("Processing invoice #10024...", level="INFO")
reporter.complete_run(status="SUCCESS")
```

---

## Useful Maintenance Commands

```powershell
# View Live Logs across containers
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Stop & clear database volume (Clean Reset)
docker compose down -v
```
