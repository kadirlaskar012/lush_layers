@echo off
REM ====================================================================
REM  LUSH LAYERS - ARTISAN CONFECTIONERY CLI LAUNCHER (WINDOWS)
REM ====================================================================

setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

python -m backend.cli %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CLI Notice] Command exited with code %ERRORLEVEL%.
)
endlocal
