@echo off
REM Comprehensive test script - runs all checks in sequence
REM Created: 2026-02-09
REM Usage: run-all-checks.bat [skip-prettier]

echo ============================================
echo Starting comprehensive test suite...
echo ============================================
echo.

REM Colors for Windows (requires ANSI support)
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

REM Track overall success
set "ALL_PASSED=1"

echo.
echo ============================================
echo [1/4] Running Jest Tests...
echo ============================================
call yarn test
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ Jest tests FAILED%NC%
    set "ALL_PASSED=0"
) else (
    echo %GREEN%✓ Jest tests PASSED%NC%
)

echo.
echo ============================================
echo [2/4] Running TypeScript Type Check...
echo ============================================
call yarn check-types
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ TypeScript check FAILED%NC%
    set "ALL_PASSED=0"
) else (
    echo %GREEN%✓ TypeScript check PASSED%NC%
)

echo.
echo ============================================
echo [3/4] Running ESLint...
echo ============================================
call yarn lint
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ ESLint FAILED%NC%
    set "ALL_PASSED=0"
) else (
    echo %GREEN%✓ ESLint PASSED%NC%
)

REM Check if we should skip prettier
if "%1"=="skip-prettier" (
    echo.
    echo ============================================
    echo [4/4] Prettier Check - SKIPPED
    echo ============================================
    echo %YELLOW%Skipped Prettier check as requested%NC%
) else (
    echo.
    echo ============================================
    echo [4/4] Running Prettier Check...
    echo ============================================
    call npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}" --ignore-path .gitignore
    if %ERRORLEVEL% NEQ 0 (
        echo %YELLOW%! Prettier found formatting issues%NC%
        echo %YELLOW%! Run 'yarn prettier' to fix%NC%
        echo %YELLOW%! Or run: run-all-checks.bat skip-prettier%NC%
        set "ALL_PASSED=0"
    ) else (
        echo %GREEN%✓ Prettier check PASSED%NC%
    )
)

echo.
echo ============================================
echo Test Suite Complete
echo ============================================

if "%ALL_PASSED%"=="1" (
    echo %GREEN%✓ All checks PASSED!%NC%
    exit /b 0
) else (
    echo %RED%✗ Some checks FAILED%NC%
    echo Please fix the errors above and try again.
    exit /b 1
)
