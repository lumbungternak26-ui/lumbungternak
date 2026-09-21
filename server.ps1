<#
.SYNOPSIS
    Server HTTP Lokal Mandiri (Zero Dependency) via PowerShell
.DESCRIPTION
    Menjalankan web server lokal untuk APLIKASI KANDANG di http://localhost:8080
    dan secara otomatis membuka browser default.
#>

$port = 8080
$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  LUMBUNG TERNAK TERPADU - BUMKAL LPM PLERET" -ForegroundColor Yellow
Write-Host "  Aplikasi Manajemen Domba, Pertanian & Limbah Kohe" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Menjalankan server lokal di: $prefix" -ForegroundColor White
Write-Host "Tekan Ctrl+C untuk menghentikan server.`n" -ForegroundColor Gray

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Port $port sedang digunakan. Mencoba port 8088..." -ForegroundColor Yellow
    $port = 8088
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

# Buka di browser
Start-Process $prefix

# Loop melayani permintaan HTTP
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath) -or $urlPath -eq "/") {
            $urlPath = "index.html"
        }

        $filePath = Join-Path $folder $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content Types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                Default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.Close()
    } catch {
        # Loop lanjut jika ada interupsi koneksi klien
    }
}
