#!/usr/bin/env python3
"""
NETRA - one command to run everything.

    python run.py

Starts the backend, the frontend and a public HTTPS tunnel, then prints the
phone URL plus a QR code in the terminal. The phone does NOT need to be on the
same wifi - the tunnel exits through Cloudflare, so mobile data works.

Ctrl+C stops everything.

Flags:
    --no-tunnel   local only, skip the public URL
    --reseed      rebuild netra.db from the Kaggle CSV
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_PORT = 8000
FRONTEND_PORT = 3000
TUNNEL_RE = re.compile(rb"https://[-a-z0-9]+\.trycloudflare\.com")

IS_WIN = os.name == "nt"
procs: list[subprocess.Popen] = []


# --- pretty output ---------------------------------------------------------
def _c(code: str, text: str) -> str:
    return text if os.environ.get("NO_COLOR") else f"\033[{code}m{text}\033[0m"


def step(msg: str) -> None:
    print(_c("36", msg), flush=True)


def ok(msg: str) -> None:
    print(_c("32", msg), flush=True)


def warn(msg: str) -> None:
    print(_c("33", msg), flush=True)


def die(msg: str) -> "None":
    print(_c("31", f"ERROR: {msg}"), file=sys.stderr, flush=True)
    sys.exit(1)


# --- helpers ---------------------------------------------------------------
def load_dotenv() -> None:
    """
    Read .env into os.environ so the launcher itself can see tunnel settings.

    The backend reads .env through pydantic-settings, but run.py needs
    CLOUDFLARE_TUNNEL_* before it starts anything. Existing environment
    variables win, so a shell override still takes precedence.
    """
    path = ROOT / ".env"
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def env() -> dict[str, str]:
    e = os.environ.copy()
    e["PYTHONPATH"] = str(ROOT)
    e["PYTHONIOENCODING"] = "utf-8"  # rupee sign on a cp1252 console
    return e


def port_open(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket() as s:
        s.settimeout(0.6)
        return s.connect_ex((host, port)) == 0


def http_ok(url: str, timeout: float = 4.0) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status < 500
    except Exception:
        return False


def wait_for(check, seconds: int, what: str, log: Path | None = None) -> None:
    deadline = time.time() + seconds
    while time.time() < deadline:
        if check():
            return
        time.sleep(0.5)
    if log and log.exists():
        print(log.read_text(errors="replace")[-1500:], file=sys.stderr)
    die(f"{what} did not start within {seconds}s")


def spawn(cmd: list[str], log_path: Path) -> subprocess.Popen:
    """Start a child in its own process group so we can kill its whole tree."""
    log = open(log_path, "wb")
    kw: dict = {"cwd": ROOT, "env": env(), "stdout": log, "stderr": subprocess.STDOUT}
    if IS_WIN:
        kw["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kw["start_new_session"] = True
    p = subprocess.Popen(cmd, **kw)
    procs.append(p)
    return p


def npm_cmd() -> str:
    # npm is a .cmd shim on Windows; shutil.which resolves it.
    exe = shutil.which("npm") or shutil.which("npm.cmd")
    if not exe:
        die("npm not found on PATH - install Node.js")
    return exe


def free_ports() -> None:
    """Kill whatever is already holding our ports, so a rerun is clean."""
    for port in (BACKEND_PORT, FRONTEND_PORT):
        if not port_open(port):
            continue
        warn(f"      port {port} busy - freeing it")
        if IS_WIN:
            out = subprocess.run(
                ["netstat", "-ano"], capture_output=True, text=True
            ).stdout
            for line in out.splitlines():
                if f":{port} " in line and "LISTENING" in line:
                    pid = line.split()[-1]
                    subprocess.run(
                        ["taskkill", "/F", "/PID", pid],
                        capture_output=True,
                    )
        else:
            subprocess.run(["pkill", "-f", f":{port}"], capture_output=True)
        time.sleep(1)


def shutdown(*_args) -> None:
    print()
    step("Stopping NETRA...")
    for p in procs:
        if p.poll() is not None:
            continue
        try:
            if IS_WIN:
                # Vite and cloudflared spawn children that outlive the parent.
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True
                )
            else:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except Exception:
            pass
    if IS_WIN:
        subprocess.run(["taskkill", "/F", "/IM", "cloudflared.exe"], capture_output=True)
    ok("Stopped.")


# --- steps -----------------------------------------------------------------
def check_deps() -> None:
    step("[1/5] Checking dependencies...")
    missing = []
    for mod in ("fastapi", "uvicorn", "aiosqlite", "bcrypt", "jwt", "greenlet", "numpy"):
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    if missing:
        warn(f"      installing: {', '.join(missing)}")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-q", "-r",
             str(ROOT / "backend" / "requirements.txt")],
            cwd=ROOT,
        )
        try:
            import jwt  # noqa: F401
        except ImportError:
            die("Python deps still missing. Run:\n"
                f"  {sys.executable} -m pip install -r backend/requirements.txt")

    if not (ROOT / "frontend" / "node_modules").exists():
        step("      installing frontend packages (one time, ~60s)...")
        r = subprocess.run([npm_cmd(), "--prefix", "frontend", "install"], cwd=ROOT)
        if r.returncode != 0:
            die("npm install failed")


def build_db(reseed: bool) -> None:
    db = ROOT / "netra.db"
    if reseed and db.exists():
        db.unlink()
    if db.exists():
        step("[2/5] Database ready.")
        return

    step("[2/5] Building database (first run, ~60s)...")
    # Order matters: the Kaggle importer needs the merchants table to exist AND
    # be populated, so create schema + synthetic merchants first.
    seed = subprocess.run(
        [sys.executable, "-c",
         "import asyncio\n"
         "from backend.app.core.database import Base, engine\n"
         "from backend.app.data.synthetic_generator import seed_synthetic_data\n"
         "async def main():\n"
         "    async with engine.begin() as c:\n"
         "        await c.run_sync(Base.metadata.create_all)\n"
         "    await seed_synthetic_data()\n"
         "asyncio.run(main())\n"],
        cwd=ROOT, env=env(),
    )
    if seed.returncode != 0:
        die("seeding failed")

    kag = subprocess.run(
        [sys.executable, "backend/app/scripts/import_kaggle_data.py", "--limit", "11500"],
        cwd=ROOT, env=env(), capture_output=True,
    )
    if kag.returncode != 0:
        warn("      Kaggle import failed - demo still works on synthetic data.")


def start_backend() -> None:
    step("[3/5] Starting backend...")
    spawn(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app",
         "--host", "127.0.0.1", "--port", str(BACKEND_PORT)],
        ROOT / "backend.log",
    )
    wait_for(lambda: http_ok(f"http://127.0.0.1:{BACKEND_PORT}/health"),
             60, "backend", ROOT / "backend.log")


def start_frontend() -> None:
    step("[4/5] Starting frontend...")
    # Vite proxies /api to the backend, so the browser only ever talks to :3000.
    # One origin => one tunnel URL covers the whole app, no CORS involved.
    spawn(
        [npm_cmd(), "--prefix", "frontend", "run", "dev", "--",
         "--host", "0.0.0.0", "--port", str(FRONTEND_PORT)],
        ROOT / "frontend.log",
    )
    wait_for(lambda: port_open(FRONTEND_PORT),
             90, "frontend", ROOT / "frontend.log")


def start_tunnel() -> tuple[str | None, bool]:
    """Return (url, reachable_from_this_machine)."""
    step("[5/5] Opening public HTTPS tunnel...")
    if not shutil.which("cloudflared"):
        warn("      cloudflared not found - phone access unavailable.")
        warn("      install: winget install Cloudflare.cloudflared")
        return None, False

    log = ROOT / "tunnel.log"
    log.unlink(missing_ok=True)

    # A NAMED tunnel keeps the same hostname on every run, so a printed QR code
    # stays valid. Set both in .env (needs a Cloudflare account + a domain):
    #   CLOUDFLARE_TUNNEL_NAME=netra
    #   CLOUDFLARE_TUNNEL_HOSTNAME=netra.yourdomain.com
    # Without them we fall back to a quick tunnel, whose URL is random per run.
    named = os.environ.get("CLOUDFLARE_TUNNEL_NAME", "").strip()
    hostname = os.environ.get("CLOUDFLARE_TUNNEL_HOSTNAME", "").strip()

    if named and hostname:
        step(f"      using named tunnel '{named}' -> https://{hostname}")
        spawn(["cloudflared", "tunnel", "run",
               "--url", f"http://127.0.0.1:{FRONTEND_PORT}", named],
              ROOT / "tunnel_stdout.log")
        url = f"https://{hostname}"
        # Give it a moment to register before we advertise the link.
        for _ in range(20):
            time.sleep(1)
            if http_ok(url, timeout=6):
                return url, True
        return url, False

    spawn(["cloudflared", "tunnel", "--url",
           f"http://127.0.0.1:{FRONTEND_PORT}", "--logfile", str(log)],
          ROOT / "tunnel_stdout.log")

    url = None
    deadline = time.time() + 50
    while time.time() < deadline:
        if log.exists():
            m = TUNNEL_RE.search(log.read_bytes())
            if m:
                url = m.group().decode()
                break
        time.sleep(1)
    if not url:
        warn("      tunnel URL not detected - check tunnel.log")
        return None, False

    # This laptop's router DNS may fail on trycloudflare.com even when the
    # tunnel is healthy. Phones on mobile data are unaffected, so report the
    # difference instead of looking broken.
    reachable = any(http_ok(url, timeout=10) for _ in range(3))
    return url, reachable


def show_qr(url: str) -> None:
    # Generated locally (see qr.py) - no pip install and no network call, so it
    # still works when this machine's DNS is misbehaving.
    try:
        import qr

        code = qr.render(url)
        qr.save_image(url, "phone-qr.png")
    except Exception as exc:
        warn(f"  (could not render QR: {exc} - type the URL above on your phone)")
        return

    try:
        print(code)
        print("  (QR image also saved to phone-qr.png)")
    except UnicodeEncodeError:
        # Legacy consoles (cp1252) cannot print block characters.
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        print(code)


def lan_ip() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return None


# --- main ------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("--no-tunnel", action="store_true", help="local only, skip public tunnel")
    ap.add_argument("--reseed", action="store_true", help="rebuild netra.db")
    ap.add_argument("--url", metavar="URL",
                    help="show the QR for this custom URL instead of public tunnel")
    args = ap.parse_args()

    load_dotenv()
    signal.signal(signal.SIGINT, lambda *a: (shutdown(), sys.exit(0)))

    print("=" * 56)
    print("  NETRA - AI Growth Copilot for Kirana Merchants")
    print("  Paytm Build for India AI Hackathon - Team KERNEL")
    print("=" * 56)

    check_deps()
    build_db(args.reseed)
    free_ports()
    start_backend()
    start_frontend()

    if args.url:
        url, reachable = args.url.rstrip("/"), http_ok(args.url, timeout=8)
        step(f"[5/5] Using custom URL: {url}")
    elif args.no_tunnel:
        url, reachable = (None, False)
    else:
        url, reachable = start_tunnel()

    print()
    ok("=" * 56)
    ok("  NETRA IS LIVE")
    ok("=" * 56)
    print(f"  This laptop : http://localhost:{FRONTEND_PORT}")
    ip = lan_ip()
    if ip:
        print(f"  Same wifi   : http://{ip}:{FRONTEND_PORT}")
    print(f"  API docs    : http://localhost:{BACKEND_PORT}/docs")

    if url:
        print()
        print(_c("1;33", f"  PHONE URL: {url}"))
        print("  Works on ANY network - mobile data, hotspot, different wifi.")
        if not reachable:
            warn("  NOTE: this laptop's DNS cannot resolve the link, but the")
            warn("        tunnel IS live. Scan it from your phone instead.")
        print()
        show_qr(url)

    ok("=" * 56)
    print("  Press Ctrl+C to stop everything.")
    print()

    try:
        while True:
            for p in procs:
                if p.poll() is not None:
                    warn(f"A service exited (pid {p.pid}). Check *.log in the project root.")
                    return
            time.sleep(2)
    except KeyboardInterrupt:
        pass
    finally:
        shutdown()


if __name__ == "__main__":
    main()
