# ToolSnapy - Complete Test Suite

Run these tests before deployment to ensure everything works.

---

## PART 1: FUNCTIONAL TESTS (Manual)

### Image Tools (5 tools)

#### 1. Resize to Target Size

- [ ] Upload PNG image (1MB+)
- [ ] Set target: 200 KB
- [ ] Click Resize - verify output is ~200KB
- [ ] Download works
- [ ] Share via ToolsSnapy works
- [ ] Change image button works

#### 2. Image Resizer

- [ ] Upload image
- [ ] Set dimensions (800x600)
- [ ] Toggle aspect ratio lock
- [ ] Use quick presets (50%, 75%)
- [ ] Download works
- [ ] Share via ToolsSnapy works

#### 3. Background Remover

- [ ] Upload photo with clear subject
- [ ] Wait for AI processing (progress bar shows)
- [ ] Verify transparent background
- [ ] Download PNG
- [ ] Share via ToolsSnapy works

#### 4. Image Converter

- [ ] Upload PNG
- [ ] Convert to JPG - verify quality slider works
- [ ] Convert to WebP
- [ ] Convert to AVIF (if browser supports)
- [ ] Download works
- [ ] Share via ToolsSnapy works

#### 5. Image to Text (OCR)

- [ ] Upload image with text
- [ ] Select language (English default)
- [ ] Click Extract Text
- [ ] Verify text extracted correctly
- [ ] Copy button works (shows "Copied!")
- [ ] Download .txt works
- [ ] Share via ToolsSnapy works

---

### PDF Tools (4 tools)

#### 1. Merge PDF

- [ ] Upload 2+ PDFs
- [ ] Reorder by dragging
- [ ] Remove one file
- [ ] Click Merge
- [ ] Download works
- [ ] Share via ToolsSnapy works

#### 2. Split & Extract PDF

- [ ] Upload multi-page PDF
- [ ] Enter page range (e.g., "1-3, 5")
- [ ] Click Extract
- [ ] Verify correct pages in output
- [ ] Download works
- [ ] Share via ToolsSnapy works

#### 3. Images to PDF

- [ ] Upload 3+ images
- [ ] Reorder images
- [ ] Click Convert
- [ ] Download PDF
- [ ] Share via ToolsSnapy works

#### 4. PDF to Images

- [ ] Upload PDF
- [ ] Select PNG format
- [ ] Select JPG format
- [ ] Click Convert
- [ ] Download individual + all
- [ ] Verify page thumbnails

---

### Text Tools (6 tools)

#### 1. Word Counter

- [ ] Paste sample text
- [ ] Verify word count
- [ ] Verify sentence count
- [ ] Verify paragraph count

#### 2. Character Counter

- [ ] Paste text
- [ ] Verify total characters
- [ ] Verify without spaces
- [ ] Verify line count

#### 3. Case Converter

- [ ] Test UPPERCASE
- [ ] Test lowercase
- [ ] Test Title Case
- [ ] Test camelCase
- [ ] Test snake_case
- [ ] Copy result works
- [ ] Share via ToolsSnapy works

#### 4. JSON Formatter

- [ ] Paste minified JSON
- [ ] Test 2-space indent
- [ ] Test 4-space indent
- [ ] Copy works
- [ ] Share via ToolsSnapy works

#### 5. JSON Validator

- [ ] Paste valid JSON - shows valid
- [ ] Paste invalid JSON - shows error location

#### 6. Random Paragraph Generator

- [ ] Generate 1 paragraph
- [ ] Generate 5 paragraphs
- [ ] Try 20 (max)
- [ ] Try >20 (should cap at 20)
- [ ] Copy all works
- [ ] Share via ToolsSnapy works

---

### Calculators (9 tools)

#### Quick Verify Each:

- [ ] Scientific Calculator - basic operations work
- [ ] BMI Calculator - enter height/weight, get BMI
- [ ] EMI Calculator - enter loan details, get EMI
- [ ] SIP Calculator - enter amount/rate, get returns
- [ ] Calorie Calculator - enter details, get TDEE
- [ ] Percentage Calculator - all modes work
- [ ] Age Calculator - pick dates, get age
- [ ] Tip Calculator - enter bill, get tip split
- [ ] Discount Calculator - enter price/discount, get final

---

### Utilities & Dev Tools (13 tools)

#### Quick Verify Each:

- [ ] Live Clock - shows current time
- [ ] Unit Converter - test length/weight/temperature
- [ ] Password Generator - generates, copy works
- [ ] UUID Generator - generates valid UUID
- [ ] Color Picker - pick color, see all formats
- [ ] QR Generator - enter text, QR appears
- [ ] Barcode Generator - enter text, barcode appears
- [ ] JWT Decoder - paste JWT, see decoded
- [ ] Base64 Tool - encode/decode works
- [ ] SHA-256 - hash text/files
- [ ] URL Encoder - encode/decode URLs
- [ ] Unix Timestamp - convert dates

---

### Instant Share (5 tools)

#### 1. Share Text

- [ ] Enter text
- [ ] Click Share
- [ ] Get 6-char code
- [ ] Copy code works

#### 2. Share Files

- [ ] Upload file(s)
- [ ] Get share code
- [ ] Shows file count

#### 3. Share Images

- [ ] Upload images
- [ ] Get share code

#### 4. Share PDFs

- [ ] Upload PDFs
- [ ] Get share code

#### 5. Receive Content

- [ ] Enter valid code
- [ ] Content appears
- [ ] Download works
- [ ] Delete works
- [ ] Try invalid code - shows error

---

## PART 2: BROWSER DEVTOOLS SECURITY TESTS

### Network Tab Tests

Open DevTools (F12) → Network tab → Perform these tests:

#### Test 1: API Calls Verification

```
Action: Use any text tool (word counter)
Check:
✓ Request goes to /api/text/word-counter
✓ No sensitive data in request headers
✓ Response only contains expected data
✓ No stack traces in errors
```

#### Test 2: CORS Headers

```
Action: Check response headers on any API call
Check:
✓ Access-Control-Allow-Origin matches your domain
✓ X-Content-Type-Options: nosniff
✓ X-Frame-Options present
✓ Content-Security-Policy present
```

#### Test 3: Rate Limit Headers

```
Action: Make requests to share API
Check:
✓ X-RateLimit-Limit header present
✓ X-RateLimit-Remaining decreases
✓ After limit: 429 status code
```

#### Test 4: File Upload Security

```
Action: Upload file via Share
Check:
✓ multipart/form-data content type
✓ No file path exposed in response
✓ Only code and expiry returned
```

#### Test 5: Error Response Security

```
Action: Send malformed JSON to /api/text/json-formatter
Check:
✓ Returns generic error message
✓ No stack trace
✓ No internal paths exposed
```

---

### Application Tab Tests

#### Test 1: Storage Security

```
Check:
✓ No sensitive data in localStorage
✓ No sensitive data in sessionStorage
✓ No auth tokens stored (none used)
✓ Only scroll positions and preferences stored
```

#### Test 2: No Secrets in Bundle

```
Action: Sources tab → Check JS bundles
Check:
✓ No API keys in code
✓ No hardcoded secrets
✓ Environment variables not exposed
```

---

### Console Tab Tests

#### Test 1: No Debug Leaks

```
Check:
✓ No console.log in production
✓ No warnings about security
✓ No exposed internal errors
```

---

## PART 3: API SECURITY TESTS (Terminal/Postman)

Run these commands to test API security:

### Test 1: CORS Enforcement

```bash
# From terminal - should be blocked if CORS is set
curl -X POST http://localhost:5000/api/text/word-counter \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{"text": "test"}'

# Expected: Request works BUT Access-Control-Allow-Origin
# should NOT include malicious-site.com in production
```

### Test 2: Rate Limiting

```bash
# Bash loop to test rate limiting on share
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/share/text \
    -H "Content-Type: application/json" \
    -d '{"text": "test"}'
  echo ""
done

# Expected: After 10 requests, get 429 Too Many Requests
```

### Test 3: Input Validation

```bash
# Missing required field
curl -X POST http://localhost:5000/api/text/word-counter \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 with "text must be a string"

# Invalid type
curl -X POST http://localhost:5000/api/text/case-converter \
  -H "Content-Type: application/json" \
  -d '{"text": "hello", "caseType": "invalid"}'

# Expected: 400 with validation error
```

### Test 4: Path Traversal Prevention

```bash
# Try to access files outside uploads
curl http://localhost:5000/api/share/../../../etc/passwd

# Expected: 404 or sanitized response, NOT file contents
```

### Test 5: Large Payload Rejection

```bash
# Send oversized text (>50KB)
curl -X POST http://localhost:5000/api/share/text \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$(python3 -c 'print("x"*100000)')\"}"

# Expected: 400 with size limit error
```

---

## PART 4: PERFORMANCE TESTS

### Lighthouse Audit

```
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

Target Scores:
✓ Performance: >80
✓ Accessibility: >90
✓ Best Practices: >90
✓ SEO: >80
```

### Load Time Test

```
Check in Network tab:
✓ Initial page load <3s
✓ Tool pages load <2s
✓ No blocking resources
✓ Images are optimized
```

---

## PART 5: CROSS-BROWSER TESTS

Test on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

Key Features to Verify:

- [ ] File uploads work
- [ ] Downloads work
- [ ] Canvas operations (image tools)
- [ ] PDF rendering
- [ ] OCR processing
- [ ] Share codes work

---

## TEST RESULTS TEMPLATE

```
Date: ___________
Tester: ___________
Environment: Development / Staging / Production

SUMMARY:
- Total Tests: 80+
- Passed: ___
- Failed: ___
- Blocked: ___

CRITICAL ISSUES:
1.
2.

MINOR ISSUES:
1.
2.

RECOMMENDATION:
[ ] Ready for deployment
[ ] Needs fixes before deployment
```

---

## AUTOMATED TEST SCRIPT (PowerShell)

Save as `test-api.ps1` and run:

```powershell
$baseUrl = "http://localhost:5000"

Write-Host "=== ToolSnapy API Test Suite ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[TEST] Health Check" -ForegroundColor Yellow
$health = Invoke-RestMethod "$baseUrl/api/health" -Method GET
if ($health.success) {
    Write-Host "PASS: API is running" -ForegroundColor Green
} else {
    Write-Host "FAIL: API not responding" -ForegroundColor Red
}

# Test 2: Word Counter
Write-Host "`n[TEST] Word Counter" -ForegroundColor Yellow
$body = @{ text = "Hello world this is a test" } | ConvertTo-Json
$result = Invoke-RestMethod "$baseUrl/api/text/word-counter" -Method POST -Body $body -ContentType "application/json"
if ($result.data.words -eq 6) {
    Write-Host "PASS: Word count correct (6)" -ForegroundColor Green
} else {
    Write-Host "FAIL: Word count incorrect" -ForegroundColor Red
}

# Test 3: Input Validation
Write-Host "`n[TEST] Input Validation" -ForegroundColor Yellow
try {
    $body = @{ nottext = "test" } | ConvertTo-Json
    Invoke-RestMethod "$baseUrl/api/text/word-counter" -Method POST -Body $body -ContentType "application/json"
    Write-Host "FAIL: Should have rejected invalid input" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "PASS: Invalid input rejected with 400" -ForegroundColor Green
    }
}

# Test 4: Share Text
Write-Host "`n[TEST] Share Text" -ForegroundColor Yellow
$body = @{ text = "Test share content" } | ConvertTo-Json
$share = Invoke-RestMethod "$baseUrl/api/share/text" -Method POST -Body $body -ContentType "application/json"
if ($share.code.Length -eq 6) {
    Write-Host "PASS: Got 6-char code: $($share.code)" -ForegroundColor Green

    # Test 5: Receive Share
    Write-Host "`n[TEST] Receive Share" -ForegroundColor Yellow
    $received = Invoke-RestMethod "$baseUrl/api/share/$($share.code)" -Method GET
    if ($received.type -eq "text") {
        Write-Host "PASS: Share retrieved successfully" -ForegroundColor Green
    }

    # Test 6: Delete Share
    Write-Host "`n[TEST] Delete Share" -ForegroundColor Yellow
    $deleted = Invoke-RestMethod "$baseUrl/api/share/$($share.code)" -Method DELETE
    if ($deleted.success) {
        Write-Host "PASS: Share deleted" -ForegroundColor Green
    }
} else {
    Write-Host "FAIL: Invalid share code" -ForegroundColor Red
}

# Test 7: Invalid Share Code
Write-Host "`n[TEST] Invalid Share Code" -ForegroundColor Yellow
try {
    Invoke-RestMethod "$baseUrl/api/share/XXXXXX" -Method GET
    Write-Host "FAIL: Should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "PASS: Invalid code returns 404" -ForegroundColor Green
    }
}

Write-Host "`n=== Test Suite Complete ===" -ForegroundColor Cyan
```

Run with:

```powershell
cd /path/to/your/My-Folder/ToolsSnapy
.\test-api.ps1
```
