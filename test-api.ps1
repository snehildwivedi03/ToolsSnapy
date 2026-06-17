# ToolSnapy API Test Script
# Run: .\test-api.ps1

param(
    [string]$baseUrl = "http://localhost:5000"
)

$passed = 0
$failed = 0

function Test-Endpoint {
    param($name, $test)
    Write-Host "`n[TEST] $name" -ForegroundColor Yellow
    try {
        $result = & $test
        if ($result) {
            Write-Host "PASS" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "FAIL" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║          ToolSnapy API Security & Functionality Test         ║
║                  Target: $baseUrl                  ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════
# BASIC CONNECTIVITY
# ═══════════════════════════════════════════════════════════════

Test-Endpoint "Health Check" {
    $r = Invoke-RestMethod "$baseUrl/api/health" -Method GET
    $r.success -eq $true -and $r.message -like "*running*"
}

# ═══════════════════════════════════════════════════════════════
# TEXT API TESTS
# ═══════════════════════════════════════════════════════════════

Test-Endpoint "Word Counter - Valid Input" {
    $body = @{ text = "Hello world this is a test" } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/word-counter" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.words -eq 6
}

Test-Endpoint "Word Counter - Missing Text (Should Fail)" {
    try {
        $body = @{ nottext = "test" } | ConvertTo-Json
        Invoke-RestMethod "$baseUrl/api/text/word-counter" -Method POST -Body $body -ContentType "application/json"
        $false # Should not reach here
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 400
    }
}

Test-Endpoint "Character Counter" {
    $body = @{ text = "Hello" } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/character-counter" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.total -eq 5
}

Test-Endpoint "Case Converter - Uppercase" {
    $body = @{ text = "hello"; caseType = "uppercase" } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/case-converter" -Method POST -Body $body -ContentType "application/json"
    $r.data.result -eq "HELLO"
}

Test-Endpoint "Case Converter - Invalid Type (Should Fail)" {
    try {
        $body = @{ text = "hello"; caseType = "invalid" } | ConvertTo-Json
        Invoke-RestMethod "$baseUrl/api/text/case-converter" -Method POST -Body $body -ContentType "application/json"
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 400
    }
}

Test-Endpoint "JSON Formatter - Valid JSON" {
    $body = @{ text = '{"name":"test"}'; indent = 2 } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/json-formatter" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.formattedJson -like "*name*"
}

Test-Endpoint "JSON Validator - Valid JSON" {
    $body = @{ text = '{"valid": true}' } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/json-validator" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.valid -eq $true
}

Test-Endpoint "JSON Validator - Invalid JSON" {
    $body = @{ text = '{invalid}' } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/json-validator" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.valid -eq $false
}

Test-Endpoint "Random Paragraph - Generate 3" {
    $body = @{ count = 3 } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/text/random-paragraph" -Method POST -Body $body -ContentType "application/json"
    $r.success -and $r.data.paragraphs.Count -eq 3
}

# ═══════════════════════════════════════════════════════════════
# SHARE API TESTS
# ═══════════════════════════════════════════════════════════════

Test-Endpoint "Share Text - Create" {
    $body = @{ text = "Test share content $(Get-Date)" } | ConvertTo-Json
    $r = Invoke-RestMethod "$baseUrl/api/share/text" -Method POST -Body $body -ContentType "application/json"
    $script:shareCode = $r.code
    $r.success -and $r.code.Length -eq 6
}

Test-Endpoint "Share Text - Retrieve" {
    if (-not $script:shareCode) { return $false }
    $r = Invoke-RestMethod "$baseUrl/api/share/$($script:shareCode)" -Method GET
    $r.type -eq "text" -and $r.content -like "*Test share*"
}

Test-Endpoint "Share Text - Delete" {
    if (-not $script:shareCode) { return $false }
    $r = Invoke-RestMethod "$baseUrl/api/share/$($script:shareCode)" -Method DELETE
    $r.success -eq $true
}

Test-Endpoint "Share - Invalid Code (Should 404)" {
    try {
        Invoke-RestMethod "$baseUrl/api/share/ZZZZZZ" -Method GET
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 404
    }
}

Test-Endpoint "Share Text - Empty Text (Should Fail)" {
    try {
        $body = @{ text = "" } | ConvertTo-Json
        Invoke-RestMethod "$baseUrl/api/share/text" -Method POST -Body $body -ContentType "application/json"
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 400
    }
}

Test-Endpoint "Share Text - Size Limit (>50KB Should Fail)" {
    try {
        $largeText = "x" * 60000
        $body = @{ text = $largeText } | ConvertTo-Json
        Invoke-RestMethod "$baseUrl/api/share/text" -Method POST -Body $body -ContentType "application/json"
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 400
    }
}

# ═══════════════════════════════════════════════════════════════
# SECURITY TESTS
# ═══════════════════════════════════════════════════════════════

Test-Endpoint "Security Headers Present" {
    $r = Invoke-WebRequest "$baseUrl/api/health" -Method GET
    $headers = $r.Headers
    ($headers["X-Content-Type-Options"] -eq "nosniff") -or 
    ($headers["X-Frame-Options"] -ne $null) -or
    ($headers["Content-Security-Policy"] -ne $null)
}

Test-Endpoint "Invalid Share Code Format Sanitized" {
    try {
        # Code with special chars should be sanitized or rejected
        Invoke-RestMethod "$baseUrl/api/share/../../etc" -Method GET
        $false
    } catch {
        # Should return 404 (not found) not 500 (error)
        $_.Exception.Response.StatusCode.value__ -eq 404
    }
}

# ═══════════════════════════════════════════════════════════════
# RATE LIMIT TEST
# ═══════════════════════════════════════════════════════════════

Test-Endpoint "Rate Limit Headers Present (Share API)" {
    $r = Invoke-WebRequest "$baseUrl/api/share/TESTXX" -Method GET -SkipHttpErrorCheck
    $headers = $r.Headers
    $headers["X-RateLimit-Limit"] -ne $null -or $headers["RateLimit-Limit"] -ne $null
}

# ═══════════════════════════════════════════════════════════════
# RESULTS
# ═══════════════════════════════════════════════════════════════

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                       TEST RESULTS                           ║
╠══════════════════════════════════════════════════════════════╣
"@ -ForegroundColor Cyan

Write-Host "║  Passed: $passed" -ForegroundColor Green -NoNewline
Write-Host "                                                 ║"
Write-Host "║  Failed: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Green"}) -NoNewline
Write-Host "                                                 ║"
Write-Host "║  Total:  $($passed + $failed)                                                ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`nAll tests passed! API is ready for deployment." -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Review issues before deployment." -ForegroundColor Yellow
}
