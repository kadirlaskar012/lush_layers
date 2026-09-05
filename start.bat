@echo off
REM ====================================================================
REM  LUSH LAYERS - ALL-IN-ONE MASTER CONTROL LAUNCHER
REM ====================================================================

setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

python -m backend.cli %*

endlocal
