#!/bin/bash
# Comprehensive test script - runs all checks in sequence
# Created: 2026-02-09
# Usage: ./run-all-checks.sh or bash run-all-checks.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall success
ALL_PASSED=1

echo "============================================"
echo "Starting comprehensive test suite..."
echo "============================================"
echo

echo
echo "============================================"
echo "[1/4] Running Jest Tests..."
echo "============================================"
yarn test
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Jest tests FAILED${NC}"
    ALL_PASSED=0
else
    echo -e "${GREEN}✓ Jest tests PASSED${NC}"
fi

echo
echo "============================================"
echo "[2/4] Running TypeScript Type Check..."
echo "============================================"
yarn check-types
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ TypeScript check FAILED${NC}"
    ALL_PASSED=0
else
    echo -e "${GREEN}✓ TypeScript check PASSED${NC}"
fi

echo
echo "============================================"
echo "[3/4] Running ESLint..."
echo "============================================"
yarn lint
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ ESLint FAILED${NC}"
    ALL_PASSED=0
else
    echo -e "${GREEN}✓ ESLint PASSED${NC}"
fi

echo
echo "============================================"
echo "[4/4] Running Prettier Check..."
echo "============================================"
npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}" --ignore-path .gitignore
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}! Prettier found formatting issues${NC}"
    echo -e "${YELLOW}! Run 'yarn prettier' to fix${NC}"
    ALL_PASSED=0
else
    echo -e "${GREEN}✓ Prettier check PASSED${NC}"
fi

echo
echo "============================================"
echo "Test Suite Complete"
echo "============================================"

if [ $ALL_PASSED -eq 1 ]; then
    echo -e "${GREEN}✓ All checks PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks FAILED${NC}"
    echo "Please fix the errors above and try again."
    exit 1
fi
