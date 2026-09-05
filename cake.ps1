# ====================================================================
#  LUSH LAYERS - ARTISAN CONFECTIONERY CLI LAUNCHER (POWERSHELL)
# ====================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

python -m backend.cli $args
