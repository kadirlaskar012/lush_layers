@echo off
REM ====================================================================
REM  LUSH LAYERS - ARTISAN CONFECTIONERY CLI LAUNCHER (WINDOWS)
REM ====================================================================

setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

python -m backend.cli %*

endlocal
