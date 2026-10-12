param([switch]$LocalDatabase, [switch]$DockerBackend, [string]$DemoPassword = 'Eventpro2026!')
$ErrorActionPreference = 'Stop'
$frontendPath = Split-Path $PSScriptRoot -Parent
$backendPath = [IO.Path]::GetFullPath((Join-Path $frontendPath '..\..\eventpro'))
if (-not $LocalDatabase) {
    $envFile = Join-Path $backendPath '.env'
    if (-not (Test-Path -LiteralPath $envFile)) { throw 'Configura el .env privado del backend con DATABASE_URL de Supabase.' }
    $databaseLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -Last 1
    if ($databaseLine -notmatch 'supabase\.(co|com)') { throw 'DATABASE_URL del backend debe apuntar a Supabase. Para datos locales usa -LocalDatabase.' }
    $supabaseArgs = @('compose', '--project-directory', $backendPath, '-p', 'eventpro-demo', '-f', (Join-Path $backendPath 'docker-compose.yml'), '-f', (Join-Path $backendPath 'docker-compose.supabase.yml'), '-f', (Join-Path $PSScriptRoot 'compose.supabase-demo.yml'))
    if (-not $DockerBackend) {
        & docker @supabaseArgs stop api worker
        & docker @supabaseArgs up -d redis
        if ($LASTEXITCODE) { throw 'No se pudo iniciar Redis.' }
        $pythonPath = Join-Path $backendPath '.venv\Scripts\python.exe'
        if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Prepara el venv del backend e instala requirements.txt.' }
        Push-Location $backendPath
        try { & $pythonPath -m alembic current; if ($LASTEXITCODE) { throw 'No se pudo conectar con Supabase.' } }
        finally { Pop-Location }
        $listener = Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue
        if ($listener) { throw 'El puerto 8000 está ocupado. Cierra el backend anterior antes de iniciar este entorno.' }
        $server = Start-Process -FilePath $pythonPath -ArgumentList '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload' -WorkingDirectory $backendPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $backendPath 'supabase-api.log') -RedirectStandardError (Join-Path $backendPath 'supabase-api.err.log') -PassThru
        $ready = $false
        for ($attempt = 0; $attempt -lt 15; $attempt++) {
            try { $health = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 3; if ($health.StatusCode -eq 200) { $ready = $true; break } } catch { }
            Start-Sleep -Seconds 1
        }
        if (-not $ready) { throw 'La API no quedó lista. Revisa supabase-api.err.log en el backend.' }
        Write-Host "Backend Supabase iniciado en Windows (PID $($server.Id)). Redis debe usar 127.0.0.1:56379 en el .env."
        Write-Host 'Frontend: npm run dev -- --port 3002'
        return
    }
    & docker @supabaseArgs up -d --build redis api
    if ($LASTEXITCODE) { throw 'No se pudo iniciar el backend con Supabase.' }
    & docker @supabaseArgs exec -T api alembic current
    if ($LASTEXITCODE) { throw 'No se pudo verificar el esquema de Supabase.' }
    Write-Host 'Backend conectado a Supabase. Se conserva el esquema y los datos compartidos.'
    Write-Host 'Frontend: npm run dev -- --port 3002'
    return
}
$env:EVENTPRO_DEMO_PASSWORD = $DemoPassword
$composeArgs = @('compose', '--project-directory', $backendPath, '-p', 'eventpro-demo', '-f', (Join-Path $backendPath 'docker-compose.yml'), '-f', (Join-Path $PSScriptRoot 'compose.demo.yml'))
& docker @composeArgs up -d --build db redis api
if ($LASTEXITCODE) { throw 'No se pudo iniciar el backend.' }
& docker @composeArgs exec -T api alembic upgrade head
if ($LASTEXITCODE) { throw 'Fallaron las migraciones.' }
& docker @composeArgs exec -T api python -m app.infrastructure.adapters.secondary.persistence.seed
if ($LASTEXITCODE) { throw 'Falló el seed.' }
& docker @composeArgs exec -T api python -m app.infrastructure.adapters.secondary.persistence.bootstrap_superadmin
if ($LASTEXITCODE) { throw 'Falló el bootstrap del administrador.' }
$demoSql = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'seed-overbooked-payment.sql') -Raw
$demoSql | & docker @composeArgs exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
if ($LASTEXITCODE) { throw 'Falló el seed de sobrecupo.' }
Write-Host 'Backend: http://localhost:8000/docs · Admin: admin@eventpro.pe'
Write-Host 'Evento demo: eeeeeeee-0000-4000-8000-000000000003'
Write-Host 'Inicia el frontend con: npm run dev -- --port 3002'
