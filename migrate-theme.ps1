# First Loop — Theme Migration Script (Windows PowerShell)
# =========================================================
# Run this from your project root: C:\Users\treyc\firstloop
# Command: .\migrate-theme.ps1

$files = @(
    "src\pages\Admin.jsx",
    "src\pages\Auth.jsx",
    "src\pages\CourseDetail.jsx",
    "src\pages\Discover.jsx",
    "src\pages\Feed.jsx",
    "src\pages\Landing.jsx",
    "src\pages\LogCourse.jsx",
    "src\pages\MapPage.jsx",
    "src\pages\Onboarding.jsx",
    "src\pages\Profile.jsx",
    "src\pages\Rankings.jsx",
    "src\pages\SubmitCourse.jsx",
    "src\components\UI.jsx"
)

$useThemeImport = "import { useTheme } from '../contexts/ThemeContext.jsx'"

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "SKIP (not found): $file" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $file -Raw -Encoding UTF8

    # ── 1. Remove B, serif, sans from the data.js import ──────────────────

    # Pattern A: import { B, serif, sans } from '../lib/data.js'
    $content = $content -replace "import \{ B, serif, sans \} from '\.\.\/lib\/data\.js'", ""

    # Pattern B: import { B, sans } from '../lib/data.js'  (App.jsx variant)
    $content = $content -replace "import \{ B, sans \} from '\.\.\/lib\/data\.js'", ""

    # Pattern C: import { B, sans, NAV_TABS } from './lib/data.js'  (App.jsx)
    # — keep NAV_TABS, just drop B and sans from that import
    $content = $content -replace "import \{ B, sans, NAV_TABS \} from '\.\/lib\/data\.js'", "import { NAV_TABS } from './lib/data.js'"

    # Clean up any blank lines left by the removed import (max 2 consecutive blanks)
    $content = $content -replace "(\r?\n){3,}", "`r`n`r`n"

    # ── 2. Add useTheme import if not already there ────────────────────────
    if ($content -notmatch "useTheme") {
        # Insert after the last existing import line
        $content = $content -replace "(import .+ from '.+'\r?\n)(?!import)", "`$1$useThemeImport`r`n"
    }

    # ── 3. Add hook call inside the default export function body ──────────
    # Find "export default function SomeName(" and add hook call on next line
    # Handles both: export default function Name() { and multiline signatures
    if ($content -notmatch "const \{ B") {
        $content = $content -replace "(export default function \w+\([^)]*\) \{)", "`$1`r`n  const { B, serif, sans } = useTheme()"
    }

    # ── 4. Handle UI.jsx — multiple exported functions ────────────────────
    # Each named export function that uses B needs the hook too
    if ($file -like "*UI.jsx*") {
        # Add hook to each named export function that doesn't already have it
        # We look for "export function Name(" patterns
        $content = $content -replace "(export function \w+\([^)]*\) \{)(?!\r?\n\s*const \{ B)", "`$1`r`n  const { B, serif, sans } = useTheme()"
    }

    # Write back with UTF8 (no BOM)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Resolve-Path $file).Path, $content, $utf8NoBom)

    Write-Host "OK: $file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Run 'npm run dev' to verify." -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see 'useTheme must be used inside ThemeProvider' errors," -ForegroundColor Yellow
Write-Host "check that src\main.jsx has ThemeProvider wrapping the app." -ForegroundColor Yellow
