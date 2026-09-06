@echo off
setlocal enabledelayedexpansion
title LUSH LAYERS - Artisan Bakery Control Center
chcp 65001 >nul 2>&1

cd /d "%~dp0"

set "PYTHON_EXE="
if exist "C:\Python314\python.exe" set "PYTHON_EXE=C:\Python314\python.exe" & goto :FOUND_PY
if exist "C:\Python313\python.exe" set "PYTHON_EXE=C:\Python313\python.exe" & goto :FOUND_PY
if exist "C:\Python312\python.exe" set "PYTHON_EXE=C:\Python312\python.exe" & goto :FOUND_PY
if exist "C:\Python311\python.exe" set "PYTHON_EXE=C:\Python311\python.exe" & goto :FOUND_PY
if exist "C:\Python310\python.exe" set "PYTHON_EXE=C:\Python310\python.exe" & goto :FOUND_PY

for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if exist "%%D\python.exe" (
        set "PYTHON_EXE=%%D\python.exe"
        goto :FOUND_PY
    )
)

for /f "tokens=*" %%i in ('where python 2^>nul') do (
    echo "%%i" | findstr /i /c:"WindowsApps" >nul
    if errorlevel 1 (
        if not defined PYTHON_EXE (
            set "PYTHON_EXE=%%i"
            goto :FOUND_PY
        )
    )
)

:FOUND_PY
if not defined PYTHON_EXE (
    echo.
    echo ======================================================================
    echo  [X] ERROR: Python was not found on your system!
    echo ======================================================================
    echo.
    pause
    exit /b 1
)

for %%F in ("%PYTHON_EXE%") do set "PY_DIR=%%~dpF"
set "PATH=%PY_DIR%;%PY_DIR%Scripts;%PATH%"

"%PYTHON_EXE%" -m backend.launcher %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo  [!] Launcher closed with notice code: %ERRORLEVEL%.
    echo ======================================================================
    echo.
    pause
)

endlocal
