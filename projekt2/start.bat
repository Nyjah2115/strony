@echo off
cd /d "%~dp0"
echo ============================================================
echo   PEC TRUCK - serwer strony
echo ============================================================
echo.
echo   Na tym komputerze otworz:   http://localhost:4173
echo.
echo   Na TELEFONIE (ta sama siec Wi-Fi) otworz w przegladarce:
echo.
echo        http://192.168.0.149:4173
echo.
echo   (Jesli Windows zapyta o dostep sieciowy - kliknij "Zezwol")
echo   Zostaw to okno otwarte. Zamkniecie = wylaczenie strony.
echo ============================================================
echo.
start "" http://localhost:4173
npx -y http-server . -a 0.0.0.0 -p 4173 -c-1
