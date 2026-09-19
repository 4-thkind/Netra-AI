<#
  NETRA demo launcher (Windows / PowerShell).

  Replaces run_demo.sh, which assumed bash + python3 + backend/venv/bin.

    .\scripts\run_demo.ps1            # local only  -> http://localhost:3000
    .\scripts\run_demo.ps1 -Tunnel    # + public HTTPS URL for phones
    .\scripts\run_demo.ps1 -Reseed    # rebuild netra.db from the Kaggle CSV

  -Tunnel prints a https://<random>.trycloudflare.com link that works on any
  phone on any network (mobile data included). No shared wifi, no account.
#>
param(
    [switch]$Tunnel,
    [switch]$Reseed
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$env:PYTHONPATH = $Root
$env:PYTHONIOENCODING = 'utf-8'   # rupee sign in console output on cp1252

function Say($m) { Write-Host $m -ForegroundColor DarkCyan }

Write-Host "========================================================"
Write-Host "  NETRA - AI Growth Copilot for Kirana Merchants"
Write-Host "  Paytm Build for India AI Hackathon"
Write-Host "========================================================"

# --- 1. Python dependencies ------------------------------------------------
# greenlet is required by SQLAlchemy's async engine but missing from
# requirements.txt; install it explicitly so a fresh machine works.
Say "Checking Python dependencies..."
python -m pip install -q -r backend/requirements.txt greenlet
if ($LASTEXITCODE -ne 0) { throw "pip install failed" }

# --- 2. Database -----------------------------------------------------------
if ($Reseed -and (Test-Path netra.db)) {
    Say "Removing existing netra.db (-Reseed)..."
    Remove-Item netra.db -Force
}

if (-not (Test-Path netra.db)) {
    # Order matters: the Kaggle importer needs the merchants table to exist and
    # to be populated, so create the schema and seed the synthetic merchants
    # FIRST. run_demo.sh called the importer against an empty file and died
    # with "no such table: merchants".
    Say "Creating schema and seeding merchants..."
    python -c @'
import asyncio
from backend.app.core.database import Base, engine
from backend.app.data.synthetic_generator import seed_synthetic_data

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_synthetic_data()

asyncio.run(main())
'@
    if ($LASTEXITCODE -ne 0) { throw "seeding failed" }

    Say "Importing Kaggle Supermart dataset (real quartiles)..."
    python backend/app/scripts/import_kaggle_data.py --limit 11500
    if ($LASTEXITCODE -ne 0) { throw "kaggle import failed" }
} else {
    Say "Using existing netra.db (pass -Reseed to rebuild)."
}

# --- 3. Frontend dependencies ---------------------------------------------
if (-not (Test-Path frontend/node_modules)) {
    Say "Installing frontend dependencies..."
    npm --prefix frontend install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}

# --- 4. Launch -------------------------------------------------------------
$jobs = @()

Say "Starting backend  (127.0.0.1:8000)..."
$jobs += Start-Process -PassThru -WindowStyle Hidden powershell -ArgumentList @(
    '-NoProfile', '-Command',
    "`$env:PYTHONPATH='$Root'; `$env:PYTHONIOENCODING='utf-8'; Set-Location '$Root'; " +
    "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
)

Say "Starting frontend (0.0.0.0:3000)..."
$jobs += Start-Process -PassThru -WindowStyle Hidden powershell -ArgumentList @(
    '-NoProfile', '-Command',
    "Set-Location '$Root'; npm --prefix frontend run dev -- --host 0.0.0.0 --port 3000"
)

# Wait for the frontend to answer before advertising URLs.
$ready = $false
foreach ($i in 1..40) {
    Start-Sleep -Milliseconds 750
    try {
        $null = Invoke-WebRequest 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 2
        $ready = $true; break
    } catch { }
}
if (-not $ready) { Write-Warning "Frontend did not answer on :3000 yet - give it a few more seconds." }

$lanIp = (Get-NetIPAddress -AddressFamily IPv4 |
          Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
          Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  NETRA IS LIVE" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  This laptop : http://localhost:3000"
if ($lanIp) { Write-Host "  Same wifi   : http://${lanIp}:3000" }
Write-Host "  API docs    : http://localhost:8000/docs"

# --- 5. Public tunnel (phone access from ANY network) ---------------------
if ($Tunnel) {
    if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
        Write-Warning "cloudflared not found. Install: winget install Cloudflare.cloudflared"
    } else {
        Write-Host ""
        Say "Opening public HTTPS tunnel (works on mobile data)..."
        $log = Join-Path $env:TEMP 'netra_tunnel.log'
        Remove-Item $log -ErrorAction SilentlyContinue
        # Tunnel port 3000 only: Vite proxies /api to the backend, so one URL
        # serves the whole app.
        $jobs += Start-Process -PassThru -WindowStyle Hidden cloudflared `
            -ArgumentList 'tunnel', '--url', 'http://127.0.0.1:3000', '--logfile', $log

        $url = $null
        foreach ($i in 1..40) {
            Start-Sleep -Seconds 1
            if (Test-Path $log) {
                $m = Select-String -Path $log -Pattern 'https://[-a-z0-9]+\.trycloudflare\.com' |
                     Select-Object -First 1
                if ($m) { $url = $m.Matches[0].Value; break }
            }
        }
        if ($url) {
            Write-Host ""
            Write-Host "  PHONE URL   : $url" -ForegroundColor Yellow
            Write-Host "  (open on any phone, any network - no shared wifi needed)"
            try {
                # QR code so a judge can scan instead of typing the URL.
                $qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$([uri]::EscapeDataString($url))"
                $qrFile = Join-Path $Root 'phone-qr.png'
                Invoke-WebRequest $qr -OutFile $qrFile -UseBasicParsing -TimeoutSec 8
                Write-Host "  QR code     : $qrFile (scan to open)"
            } catch { Write-Host "  (QR generation skipped - no internet)" }
        } else {
            Write-Warning "Tunnel URL not detected. Check $log"
        }
    }
}

Write-Host "========================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop everything."

try {
    while ($true) { Start-Sleep -Seconds 3600 }
} finally {
    Say "Stopping NETRA..."
    foreach ($p in $jobs) { try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {} }
    Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='cloudflared.exe'" |
        Where-Object { $_.CommandLine -match 'netra|3000|trycloudflare' } |
        ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }
}
