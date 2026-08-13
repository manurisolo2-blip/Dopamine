@echo off
title DOPAMINE STREETWEAR - SERVIDOR FULLSTACK
cls
echo ===================================================================
echo               DOPAMINE STREETWEAR - SERVIDOR FULLSTACK
echo ===================================================================
echo  Iniciando backend con soporte multi-dispositivo y base de datos...
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo  Iniciando Servidor Fullstack Dopamine con Python...
    echo.
    timeout /t 1 >nul
    start http://localhost:3000/login.html
    start http://localhost:3000/admin-clientes.html
    python backend/server.py
    pause
    exit /b
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo  Iniciando Servidor Fullstack Dopamine con Py Launcher...
    echo.
    timeout /t 1 >nul
    start http://localhost:3000/login.html
    start http://localhost:3000/admin-clientes.html
    py backend/server.py
    pause
    exit /b
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo  Iniciando Servidor con Node.js...
    cd /d "%~dp0backend"
    start http://localhost:3000/login.html
    start http://localhost:3000/admin-clientes.html
    node server.js
    pause
    exit /b
)

echo [ERROR] No se encontro ni Python ni Node.js en el sistema.
echo Por favor instala Python desde https://python.org o Node.js desde https://nodejs.org
pause
