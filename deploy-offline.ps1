# RPA Orchestrator — Automated Offline Windows VM Deployment Script
# Run this script in PowerShell as Administrator on the target Windows VM

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RPA Orchestrator Platform - Offline VM Deployment Script" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check Docker status
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker is not installed. Please install Docker Desktop for Windows first." -ForegroundColor Red
    Exit 1
}

Write-Host "[1/3] Loading pre-built Docker container images from rpa-orchestrator-deployable.tar..." -ForegroundColor Yellow
docker load -i rpa-orchestrator-deployable.tar

Write-Host "[2/3] Launching multi-container setup via Docker Compose..." -ForegroundColor Yellow
docker compose up -d

Write-Host "[3/3] Configuring Windows Firewall Rules for Ports 3000, 8080, 8081..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "RPA Orchestrator Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
New-NetFirewallRule -DisplayName "RPA Orchestrator Backend API" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
New-NetFirewallRule -DisplayName "RPA Orchestrator Reporter API" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " SUCCESS! RPA Orchestrator Platform is deployed and running!" -ForegroundColor Green
Write-Host " - Frontend Dashboard UI : http://localhost:3000" -ForegroundColor Green
Write-Host " - Backend API           : http://localhost:8080" -ForegroundColor Green
Write-Host " - Reporter API          : http://localhost:8081" -ForegroundColor Green
Write-Host " - H2 Database Console   : http://localhost:8080/h2-console" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
