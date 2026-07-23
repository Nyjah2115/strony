@echo off
chcp 65001 >nul
title Serwis Sobowiec - podglad strony
cd /d "%~dp0"

echo.
echo  ============================================
echo   Serwis Sobowiec - lokalny podglad strony
echo  ============================================
echo.
echo  Strona bedzie dostepna pod adresem:
echo     http://localhost:8080
echo.
echo  UWAGA: model 3D wymaga serwera - dlatego nie
echo  otwieraj index.html przez dwuklik (przegladarka
echo  blokuje wtedy wczytanie pliku .glb).
echo.
echo  Aby zatrzymac serwer: zamknij to okno lub Ctrl+C
echo.

start "" http://localhost:8080/index.html

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server 8080
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    py -m http.server 8080
    goto :eof
)

echo  [BLAD] Nie znaleziono Pythona.
echo  Zainstaluj Pythona albo uruchom inny serwer, np.:
echo     npx serve .
echo.
pause
