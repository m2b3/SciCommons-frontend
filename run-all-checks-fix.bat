@echo off
REM Comprehensive test script with AUTO-FIX - runs all checks and fixes issues
REM Created: 2026-02-09
REM This matches what the git pre-commit hook used to do (but on all files)

echo ============================================
echo Starting checks with AUTO-FIX...
echo ============================================
echo.

REM Colors for Windows (requires ANSI support)
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM Track overall success
set "ALL_PASSED=1"

echo.
echo ============================================
echo [1/4] Auto-fixing Prettier Formatting...
echo ============================================
call yarn prettier
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ Prettier FAILED%NC%
    set "ALL_PASSED=0"
) else (
    echo %GREEN%✓ Prettier formatting FIXED%NC%
)

echo.
echo ============================================
echo [2/4] Auto-fixing ESLint Issues...
echo ============================================
call yarn lint:fix
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%! ESLint auto-fix completed with warnings%NC%
    echo %YELLOW%! Some issues may require manual fixes%NC%
) else (
    echo %GREEN%✓ ESLint auto-fix COMPLETED%NC%
)

echo.
echo ============================================
echo [3/4] Running TypeScript Type Check (Fast)...
echo ============================================
call yarn check-types:fast
if %ERRORLEVEL% NEQ 0 (
    echo %RED%✗ TypeScript check FAILED%NC%
    set "ALL_PASSED=0"
) else (
    echo %GREEN%✓ TypeScript check PASSED%NC%
)

echo.
echo ============================================
echo [4/4] Running Jest Tests...
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
echo Test Suite Complete
echo ============================================

if "%ALL_PASSED%"=="1" (
    echo %GREEN%✓ All checks PASSED! Ready to commit.%NC%
    exit /b 0
) else (
    echo %RED%✗ Some checks FAILED%NC%
    echo Please fix the errors above before committing.
    exit /b 1
)
