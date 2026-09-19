import sys
import os
import traceback

# Add root directory to sys.path so 'backend.app...' imports work cleanly on Vercel
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app.main import app
except Exception as e:
    err_msg = traceback.format_exc()
    print("STARTUP IMPORT ERROR:\n" + err_msg, file=sys.stderr)
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    app = FastAPI(title="Netra Startup Error Handler")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    async def catch_all_error(path: str = ""):
        return PlainTextResponse(
            f"Netra Vercel Startup Error Traceback:\n\n{err_msg}\n\nPython Version: {sys.version}\nPath: {sys.path}",
            status_code=500
        )
