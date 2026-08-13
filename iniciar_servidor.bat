@echo off
title DOPAMINE STREETWEAR - SERVIDOR LOCAL
cls
echo ===================================================================
echo               DOPAMINE STREETWEAR - SERVIDOR LOCAL
echo ===================================================================
echo  Servidor iniciado correctamente en: http://localhost:8000
echo.
echo  PAGINAS DISPONIBLES:
echo   - TIENDA:       http://localhost:8000/index.html
echo   - LOGIN / REG:  http://localhost:8000/login.html
echo   - ADMIN BASE:   http://localhost:8000/admin-clientes.html
echo.
echo  Abriendo Login y Consola de Clientes en tu navegador...
echo ===================================================================
timeout /t 2 >nul
start http://localhost:8000/login.html
start http://localhost:8000/admin-clientes.html
python -m http.server 8000
pause
