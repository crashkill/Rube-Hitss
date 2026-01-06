param(
  [string]$CoolifyUrl = "https://fsw-hitss.duckdns.org",
  [string]$Token,
  [string]$AppUuid,
  [string]$Domain,
  [switch]$ForceRedeploy,
  [switch]$Follow,
  [switch]$SkipCertCheck,
  [int]$IntervalSec = 10,
  [int]$MaxAttempts = 120
)

$ErrorActionPreference = 'SilentlyContinue'
try { [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 } catch {}
if ($SkipCertCheck) { try { [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true } } catch {} }

if (-not $Token) { $Token = $env:COOLIFY_TOKEN }
if (-not $AppUuid) { $AppUuid = $env:COOLIFY_APP_UUID }
if (-not $Domain) { $Domain = $env:APP_DOMAIN }

if (-not $Token -or -not $AppUuid -or -not $Domain) {
  Write-Output "Parâmetros ausentes. Defina Token, AppUuid e Domain."
  exit 1
}

$headers = @{ Authorization = "Bearer $Token"; Accept = 'application/json' }

Write-Output ("[Monitor] Iniciado às {0}" -f (Get-Date))

if ($ForceRedeploy) {
  try {
    $resp = Invoke-RestMethod -Headers $headers -Uri ("{0}/api/v1/deploy?uuid={1}&force=true" -f $CoolifyUrl, $AppUuid) -Method Get -TimeoutSec 60
    Write-Output "[Monitor] Redeploy acionado"
    $deployUuid = $null
    if ($resp -and $resp.deployments -and $resp.deployments.Count -gt 0) {
      $deployUuid = $resp.deployments[0].deployment_uuid
      if ($deployUuid) { Write-Output ("[Monitor] deployment_uuid: {0}" -f $deployUuid) }
    }
  } catch {
    Write-Output ("[Monitor] Falha ao acionar redeploy: {0}" -f $_.Exception.Message)
  }
}

if (-not $deployUuid) {
  try {
    $list = Invoke-RestMethod -Headers $headers -Uri ("{0}/api/v1/deploy?uuid={1}" -f $CoolifyUrl, $AppUuid) -Method Get -TimeoutSec 30
    $mine = @($list.deployments)
    if ($mine.Count -gt 0) { $deployUuid = $mine[-1].deployment_uuid }
  } catch {
    try {
      $list = Invoke-RestMethod -Headers $headers -Uri ("{0}/api/v1/deploy" -f $CoolifyUrl) -Method Get -TimeoutSec 30
      $mine = @($list.deployments | Where-Object { $_.resource_uuid -eq $AppUuid })
      if ($mine.Count -gt 0) { $deployUuid = $mine[-1].deployment_uuid }
    } catch {}
  }
}

for ($i = 1; $i -le $MaxAttempts; $i++) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  try {
    $http = Invoke-WebRequest -Uri ("http://{0}" -f $Domain) -Method Head -UseBasicParsing -TimeoutSec 8
    Write-Output ("[{0}] HTTP {1}" -f $ts, $http.StatusCode)
    if ($http.StatusCode -eq 200) { Write-Output "[Monitor] HTTP 200 OK"; break }
  } catch {
    Write-Output ("[{0}] HTTP erro: {1}" -f $ts, $_.Exception.Message)
  }

  try {
    $https = Invoke-WebRequest -Uri ("https://{0}" -f $Domain) -Method Head -UseBasicParsing -TimeoutSec 8
    Write-Output ("[{0}] HTTPS {1}" -f $ts, $https.StatusCode)
  } catch {
    Write-Output ("[{0}] HTTPS erro: {1}" -f $ts, $_.Exception.Message)
  }

  try {
    $deploys = Invoke-RestMethod -Headers $headers -Uri ("{0}/api/v1/deploy?uuid={1}" -f $CoolifyUrl, $AppUuid) -Method Get -TimeoutSec 30
    $mine = @($deploys.deployments)
    if ($mine.Count -gt 0) {
      $last = $mine[-1]
      Write-Output ("[{0}] Último deployment: {1}" -f $ts, $last.deployment_uuid)
    } else {
      Write-Output ("[{0}] Nenhum deployment listado para o recurso" -f $ts)
    }
  } catch {
    Write-Output ("[{0}] Falha ao consultar deploys: {1}" -f $ts, $_.Exception.Message)
  }

  if ($deployUuid) {
    try {
      $d = Invoke-RestMethod -Headers $headers -Uri ("{0}/api/v1/deployments/{1}" -f $CoolifyUrl, $deployUuid) -Method Get -TimeoutSec 30
      if ($d.status) { Write-Output ("[{0}] Status do deploy: {1}" -f $ts, $d.status) }
      if ($d.logs) {
        if (-not (Get-Variable -Name lastLen -ErrorAction SilentlyContinue)) { $lastLen = 0 }
        $text = [string]$d.logs
        if ($text.Length -gt $lastLen) {
          $new = $text.Substring($lastLen)
          if ($Follow) { Write-Output $new }
          $lastLen = $text.Length
        }
      }
      if ($d.status -match 'success|failed|error|cancel') { break }
    } catch {}
  }
  Start-Sleep -Seconds $IntervalSec
}

Write-Output ("[Monitor] Finalizado às {0}" -f (Get-Date))
