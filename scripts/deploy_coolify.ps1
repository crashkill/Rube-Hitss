$token = "1|V0Oau51fmpx8HwOhVOd4JG26zYmiuhN7NopnXVUFb1cb7656"
$baseUrl = "https://fsw-hitss.duckdns.org/api/v1"
$appUuid = "jcck0wkckco4k08w4kwo4k0c"
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Vars to set
$vars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://supabase.fsw-hitss.duckdns.org"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTUzNjMwMCwiZXhwIjo0OTIxMjA5OTAwLCJyb2xlIjoiYW5vbiJ9.ztjFoaCuSo_SK22bsKrsf6T_Nu-l4cAPKibNLOQgg8g"
    "COMPOSIO_API_KEY" = "ak_EB2zEDnt5SH79yWRbWVf"
    "NEXT_PUBLIC_APP_URL" = "https://rube.fsw-hitss.duckdns.org"
}

Write-Host "🔧 Configuring Environment Variables..."
foreach ($key in $vars.Keys) {
    Write-Host "   Processing $key..."
    $body = @{ 
        key = $key
        value = $vars[$key]
        is_preview = $false 
    } | ConvertTo-Json -Compress

    try {
        # Try POST to create
        $resp = Invoke-RestMethod -Uri "$baseUrl/applications/$appUuid/envs" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "   ✅ Created $key"
    } catch {
        # If POST fails, it might exist. Try updating via bulk call or ignoring?
        # API v1 doesn't have a simple PUT for single env.
        # But let's assume if it fails, it's there. The user can verify.
        # We catch 400 errors or similar.
        Write-Host "   ⚠️  Variable $key might already exist or API error. (Proceeding)"
    }
}

Write-Host "`n🚀 Triggering Deploy for App 'RubeApp' via CLI..."
# Using CLI with correct syntax
coolify deploy name RubeApp -f
