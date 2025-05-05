@echo off
setlocal enabledelayedexpansion

:: Script de démarrage rapide pour Deck
:: Usage: start.bat [port]

echo.
echo =========================================
echo      Deck - Virtual Stream Deck
echo =========================================
echo.

:: Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js n'est pas installé.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo.
    echo Exécutez install.bat pour l'installation complète.
    goto end
)

:: Vérifier si le fichier .env existe
if not exist ".env" (
    echo [INFO] Fichier .env non trouvé, création d'un fichier par défaut...
    
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [INFO] Fichier .env créé à partir de .env.example
    ) else (
        :: Créer un fichier .env par défaut
        echo # Configuration de base > .env
        echo PORT=%1 >> .env
        if "%1"=="" (
            echo PORT=3000 > .env
        )
        echo HOST=0.0.0.0>> .env
        echo PIN_LENGTH=4>> .env
        echo PIN_CUSTOM=>> .env
        echo MAX_CONNECTIONS=10>> .env
        echo LOG_LEVEL=info>> .env
        echo [INFO] Fichier .env créé avec les paramètres par défaut
    )
)

:: Si un port est spécifié en argument, modifier le fichier .env
set "port=%1"
if not "%port%"=="" (
    powershell -Command "(Get-Content .env) -replace '^PORT=.*', 'PORT=%port%' | Set-Content .env"
    if not !ERRORLEVEL! == 0 (
        echo PORT=%port%>> .env
    )
    echo [INFO] Port configuré sur: %port%
)

:: Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo [INFO] Dépendances non installées, installation en cours...
    call npm install
    echo [INFO] Dépendances installées
)

echo.
echo [INFO] Démarrage de Deck...
echo.

:: Démarrer l'application
node main.js

:: Code d'erreur
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Erreur lors du démarrage de Deck
    echo Consultez les logs pour plus d'informations.
    exit /b 1
)

:end
exit /b
