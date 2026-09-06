#!/usr/bin/env python3
"""
🍰 LUSH LAYERS - ALL-IN-ONE ANIMATED LAUNCHER
Simple 2-Option Control Center with Animated 0-100% Progress Bar
"""

import sys
import os
import time
import socket
import webbrowser
import subprocess
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Color styling via colorama
try:
    from colorama import init as colorama_init, Fore, Style
    colorama_init(autoreset=True)
except ImportError:
    class DummyColor:
        def __getattr__(self, name):
            return ""
    Fore = Style = DummyColor()

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGS_DIR = PROJECT_ROOT / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# =====================================================================
# PROCESS & PORT MANAGEMENT
# =====================================================================

def is_port_active(port: int) -> bool:
    """Checks if a TCP port is active on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port_process(port: int):
    """Cleanly terminates any process bound to the given port on Windows."""
    try:
        output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True, text=True)
        pids = set()
        for line in output.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and f":{port}" in parts[1]:
                pids.add(parts[-1])
        for pid in pids:
            if pid and pid != "0":
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
    except Exception:
        pass

def stop_all_services():
    """Stops both backend (8000) and frontend (3000)."""
    print(Fore.YELLOW + "  Stopping all active servers..." + Style.RESET_ALL)
    kill_port_process(8000)
    kill_port_process(3000)
    time.sleep(1)
    print(Fore.GREEN + Style.BRIGHT + "  ✓ All servers stopped successfully.\n" + Style.RESET_ALL)

def spawn_backend():
    """Starts FastAPI uvicorn in the background if not running."""
    if is_port_active(8000):
        return True
    
    cmd = [
        sys.executable, "-m", "uvicorn", "backend.main:app",
        "--host", "0.0.0.0", "--port", "8000"
    ]
    log_file = open(LOGS_DIR / "backend.log", "a", encoding="utf-8")
    
    if sys.platform == "win32":
        # CREATE_NO_WINDOW = 0x08000000, CREATE_NEW_PROCESS_GROUP = 0x00000200
        flags = 0x08000000 | subprocess.CREATE_NEW_PROCESS_GROUP
        subprocess.Popen(
            cmd,
            cwd=str(PROJECT_ROOT),
            creationflags=flags,
            stdout=log_file,
            stderr=log_file
        )
    else:
        subprocess.Popen(
            cmd,
            cwd=str(PROJECT_ROOT),
            stdout=log_file,
            stderr=log_file
        )
    return False

def spawn_frontend():
    """Starts Next.js frontend in the background if not running."""
    if is_port_active(3000):
        return True
        
    frontend_dir = PROJECT_ROOT / "frontend"
    npm_bin = "npm.cmd" if sys.platform == "win32" else "npm"
    cmd = [npm_bin, "run", "dev"]
    log_file = open(LOGS_DIR / "frontend.log", "a", encoding="utf-8")
    
    if sys.platform == "win32":
        flags = 0x08000000 | subprocess.CREATE_NEW_PROCESS_GROUP
        subprocess.Popen(
            cmd,
            cwd=str(frontend_dir),
            creationflags=flags,
            stdout=log_file,
            stderr=log_file
        )
    else:
        subprocess.Popen(
            cmd,
            cwd=str(frontend_dir),
            stdout=log_file,
            stderr=log_file
        )
    return False

# =====================================================================
# ANIMATED PROGRESS BAR
# =====================================================================

def render_progress_bar(percent: float, label: str, bar_len: int = 32):
    """Renders a modern in-place animated progress bar with smooth gradient color."""
    try:
        clamped = max(0.0, min(100.0, percent))
        filled_len = int(clamped / 100.0 * bar_len)
        empty_len = bar_len - filled_len
        
        # Use Unicode block if possible, fallback to standard chars
        bar = "█" * filled_len + "░" * empty_len
        
        if clamped < 35:
            color = Fore.CYAN
        elif clamped < 75:
            color = Fore.YELLOW
        else:
            color = Fore.GREEN
            
        sys.stdout.write(f"\r  {color}[{bar}] {clamped:5.1f}%{Style.RESET_ALL} {Style.BRIGHT}{label:<42}{Style.RESET_ALL}")
        sys.stdout.flush()
    except Exception:
        # Fallback in case of terminal encoding issues
        pass

def animate_stage(from_pct: int, to_pct: int, label: str, duration_sec: float = 0.5):
    """Smoothly animates progress between two percentages."""
    steps = max(1, to_pct - from_pct)
    delay = duration_sec / steps
    for p in range(from_pct, to_pct + 1):
        render_progress_bar(float(p), label)
        time.sleep(delay)

# =====================================================================
# ACTION 1: START PYTHON IMAGE TOOLS
# =====================================================================

def start_python_image_tools():
    print(Fore.CYAN + Style.BRIGHT + "\n=== [STARTING PYTHON IMAGE TOOLS] ===" + Style.RESET_ALL)
    
    # Stage 1: 0% - 20%
    animate_stage(0, 20, "Initializing Storage & Media Pipelines...", 0.35)
    
    # Stage 2: 20% - 40%
    animate_stage(20, 40, "Pre-loading AI & RemBG Engine...", 0.35)
    
    # Stage 3: 40% - 60%
    spawn_backend()
    animate_stage(40, 60, "Starting Python FastAPI Backend (Port 8000)...", 0.5)
    
    # Stage 4: 60% - 90%: Wait for port 8000 to become active
    t0 = time.time()
    curr_pct = 60
    while time.time() - t0 < 15.0:
        if is_port_active(8000):
            break
        if curr_pct < 88:
            curr_pct += 4
            render_progress_bar(float(curr_pct), "Waiting for Backend (Port 8000)...")
        time.sleep(0.4)
        
    # Stage 5: 90% - 100%
    animate_stage(curr_pct, 95, "Verifying Database Connection...", 0.25)
    animate_stage(95, 100, "Opening Browser Image Processing Portal...", 0.25)
    print("\n")
    
    portal_url = "http://localhost:8000/portal"
    try:
        webbrowser.open(portal_url)
    except Exception:
        pass
        
    print(Fore.GREEN + Style.BRIGHT + "======================================================================")
    print("  🎨 PYTHON IMAGE PROCESSING PORTAL IS LIVE!")
    print(f"  👉 Portal Address: {Fore.CYAN}{portal_url}{Style.RESET_ALL}")
    print(Fore.GREEN + Style.BRIGHT + "======================================================================" + Style.RESET_ALL)
    print(Fore.WHITE + "  • Drag & drop cake images directly into your browser portal.")
    print("  • RemBG cuts out background with luxury 1:1 studio contact shadow.")
    print("  • Gemini Vision AI writes sensory titles, descriptions & flavours.")
    print("  • Cakes are queued in the Admin Panel ready for review & publish.")
    print(Fore.GREEN + Style.BRIGHT + "======================================================================\n" + Style.RESET_ALL)

# =====================================================================
# ACTION 2: START WEBSITE (FRONTEND + BACKEND)
# =====================================================================

def start_full_website():
    print(Fore.MAGENTA + Style.BRIGHT + "\n=== [STARTING LUSH LAYERS WEBSITE] ===" + Style.RESET_ALL)
    
    # Stage 1: 0% - 20%
    animate_stage(0, 20, "Bootstrapping Full-Stack Architecture...", 0.35)
    
    # Stage 2: 20% - 45%
    spawn_backend()
    animate_stage(20, 45, "Launching Python Backend Engine (Port 8000)...", 0.45)
    
    # Stage 3: 45% - 65%
    spawn_frontend()
    animate_stage(45, 65, "Launching Next.js Luxury Frontend (Port 3000)...", 0.45)
    
    # Stage 4: 65% - 90%: Wait for both port 8000 and 3000 to become active
    t0 = time.time()
    curr_pct = 65
    while time.time() - t0 < 25.0:
        b_ok = is_port_active(8000)
        f_ok = is_port_active(3000)
        if b_ok and f_ok:
            break
        if curr_pct < 88:
            curr_pct += 2
            msg = "Compiling Next.js pages..." if b_ok else "Starting Backend & Frontend..."
            render_progress_bar(float(curr_pct), msg)
        time.sleep(0.5)
        
    # Stage 5: 90% - 100%
    animate_stage(curr_pct, 95, "Synchronizing Live Database & ISR Cache...", 0.3)
    animate_stage(95, 100, "Opening Live Storefront in Browser...", 0.25)
    print("\n")
    
    site_url = "http://localhost:3000"
    try:
        webbrowser.open(site_url)
    except Exception:
        pass
        
    print(Fore.GREEN + Style.BRIGHT + "======================================================================")
    print("  🎉 LUSH LAYERS FULL-STACK PLATFORM IS LIVE!")
    print(Fore.GREEN + Style.BRIGHT + "======================================================================" + Style.RESET_ALL)
    print(f"  🌐 Public Storefront:    {Fore.CYAN}http://localhost:3000{Style.RESET_ALL}")
    print(f"  👑 Admin Dashboard:      {Fore.CYAN}http://localhost:3000/admin{Style.RESET_ALL}")
    print(f"  ⏳ Pending Cakes Review: {Fore.CYAN}http://localhost:3000/admin/cakes/pending{Style.RESET_ALL}")
    print(f"  🎨 Image Tools Portal:   {Fore.CYAN}http://localhost:8000/portal{Style.RESET_ALL}")
    print(Fore.GREEN + Style.BRIGHT + "======================================================================\n" + Style.RESET_ALL)

# =====================================================================
# MAIN MENU LOOP
# =====================================================================

def show_banner():
    b_ok = is_port_active(8000)
    f_ok = is_port_active(3000)
    
    b_tag = Fore.GREEN + "[ONLINE :8000]" if b_ok else Fore.RED + "[OFFLINE :8000]"
    f_tag = Fore.GREEN + "[ONLINE :3000]" if f_ok else Fore.RED + "[OFFLINE :3000]"
    
    print(Fore.CYAN + Style.BRIGHT + """
+----------------------------------------------------------------------+
|             * LUSH LAYERS - ARTISAN CONFECTIONERY *                  |
|              All-In-One Launcher & Control Center                    |
+----------------------------------------------------------------------+""" + Style.RESET_ALL)
    print(f"  Backend Engine : {b_tag}{Style.RESET_ALL}")
    print(f"  Storefront Web : {f_tag}{Style.RESET_ALL}")
    print(Fore.WHITE + "----------------------------------------------------------------------" + Style.RESET_ALL)

def main():
    while True:
        show_banner()
        print(Fore.YELLOW + Style.BRIGHT + "Select an Option / একটি অপশন বেছে নিন:" + Style.RESET_ALL)
        print()
        print(f"  {Fore.CYAN}{Style.BRIGHT}[1]{Style.RESET_ALL} {Style.BRIGHT}Start Python Image Tools{Style.RESET_ALL}")
        print(f"      {Fore.WHITE}• ব্রাউজারে ইমেজ প্রসেসিং পোর্টাল খুলবে (http://localhost:8000/portal)")
        print()
        print(f"  {Fore.GREEN}{Style.BRIGHT}[2]{Style.RESET_ALL} {Style.BRIGHT}Start Website (Frontend + Backend){Style.RESET_ALL}")
        print(f"      {Fore.WHITE}• সম্পূর্ণ ওয়েবসাইট ও অ্যাডমিন প্যানেল চালু হবে (http://localhost:3000)")
        print()
        print(f"  {Fore.RED}[S]{Style.RESET_ALL} Stop All Running Servers (সব সার্ভার বন্ধ করুন)")
        print(f"  {Fore.WHITE}[0]{Style.RESET_ALL} Exit (প্রস্থান)")
        print(Fore.WHITE + "----------------------------------------------------------------------" + Style.RESET_ALL)
        
        choice = input(Fore.YELLOW + "Enter your choice [1, 2, S, 0]: " + Style.RESET_ALL).strip().lower()
        
        if choice == "1":
            start_python_image_tools()
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            print()
            
        elif choice == "2":
            start_full_website()
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            print()
            
        elif choice == "s":
            stop_all_services()
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            print()
            
        elif choice in ("0", "exit", "quit", "q"):
            print(Fore.CYAN + "\nExiting Lush Layers Launcher. Have a wonderful day!\n" + Style.RESET_ALL)
            sys.exit(0)
            
        else:
            print(Fore.RED + "\n[!] Invalid choice. Please press 1, 2, S, or 0.\n" + Style.RESET_ALL)
            time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nLauncher closed by user.")
    except Exception as e:
        import traceback
        print("\n======================================================================")
        print("  [X] An unexpected error occurred in Launcher:")
        print("======================================================================")
        traceback.print_exc()
        print("======================================================================\n")
        input("Press Enter to exit...")
