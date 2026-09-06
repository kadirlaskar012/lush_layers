@echo off
setlocal enabledelayedexpansion
title LUSH LAYERS - Artisan Bakery Launcher
chcp 65001 >nul 2>&1

cd /d "%~dp0"

set "PYTHON_EXE="
if exist "C:\Python314\python.exe" (
    set "PYTHON_EXE=C:\Python314\python.exe"
    set "PATH=C:\Python314;C:\Python314\Scripts;%PATH%"
) else (
    for /f "tokens=*" %%i in ('where python 2^>nul') do (
        echo "%%i" | findstr /i /c:"WindowsApps" >nul
        if errorlevel 1 (
            if not defined PYTHON_EXE set "PYTHON_EXE=%%i"
        )
    )
)

if not defined PYTHON_EXE (
    set "PYTHON_EXE=python"
)

"%PYTHON_EXE%" -m backend.launcher %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo  [!] Launcher finished with notice or code: %ERRORLEVEL%.
    echo ======================================================================
    echo.
    pause
)

endlocal
