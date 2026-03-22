# Comprehensive Test Scripts

This directory contains scripts to run all quality checks before committing code.

## 🔥 IMPORTANT: Pre-commit Hooks Disabled

Git pre-commit hooks are **DISABLED**. You must run checks manually before committing:

```bash
# Auto-fix issues (recommended before commit)
yarn test:fix
# or
run-all-checks-fix.bat
```

## Quick Start

### Before Committing (Auto-fix Mode) ⭐ RECOMMENDED

**Windows:**

```bash
run-all-checks-fix.bat
```

**Cross-platform:**

```bash
yarn test:fix
```

This will:

- ✅ Auto-fix Prettier formatting
- ✅ Auto-fix ESLint issues
- ✅ Run TypeScript type check (fast mode)
- ✅ Run Jest tests

### Check Only (No Auto-fix)

**Windows:**

```bash
run-all-checks.bat
```

**Cross-platform:**

```bash
yarn test:all
```

## What Gets Checked

The comprehensive test suite runs the following checks in sequence:

### 1. Jest Tests (`yarn test`)

- Runs all unit and integration tests
- Tests for components, utilities, stores, and hooks
- Validates application logic and behavior

### 2. TypeScript Type Check (`yarn check-types`)

- Runs `tsc --noEmit` to check for type errors
- Validates TypeScript types across the entire codebase
- Catches type mismatches and interface violations

### 3. ESLint (`yarn lint`)

- Runs `next lint` to check code quality
- Validates code style and best practices
- Checks for potential bugs and anti-patterns

### 4. Prettier Check (`yarn prettier:check`)

- Verifies code formatting consistency
- Checks if all files match Prettier config
- **Note**: Does NOT auto-fix (use `yarn prettier` to fix)

## Exit Codes

- **0**: All checks passed ✓
- **1**: One or more checks failed ✗

## All Available Commands

### Auto-Fix Commands (Use Before Commit)

```bash
# Full check + auto-fix (matches old pre-commit hook)
yarn test:fix

# Just the pre-commit checks (no Jest tests)
yarn precommit-checks

# Individual auto-fix commands
yarn prettier          # Auto-fix formatting
yarn lint:fix          # Auto-fix linting issues
```

### Check-Only Commands (No Auto-fix)

```bash
# Full check suite
yarn test:all

# Quick check (skip prettier)
yarn test:quick
```

### Individual Check Commands

You can also run checks individually:

```bash
# Run only Jest tests
yarn test

# Run only TypeScript check (full)
yarn check-types

# Run only TypeScript check (fast, skips lib checks)
yarn check-types:fast

# Run only ESLint (check)
yarn lint

# Run only Prettier check
yarn prettier:check

# Auto-fix Prettier issues
yarn prettier

# Auto-fix ESLint issues
yarn lint:fix
```

## Pre-commit Hooks - DISABLED

⚠️ **Git pre-commit hooks are DISABLED** to give you full control.

**You must manually run checks before committing:**

```bash
# Recommended: Auto-fix everything before commit
yarn test:fix

# Or use the batch file
run-all-checks-fix.bat
```

### Why Disabled?

- You can choose when to run checks (faster workflow)
- Auto-fix runs on **all files** not just staged files (more consistent)
- You can commit work-in-progress without waiting for checks
- Better for large changes affecting many files

### When to Run Checks

Run checks before:

- ✅ **Every commit** (use `yarn test:fix`)
- ✅ Creating a pull request
- ✅ Merging branches
- ✅ Before deployment

## Troubleshooting

### Tests Failing

```bash
# Run tests in watch mode for debugging
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### TypeScript Errors

```bash
# Check types with detailed output
yarn check-types

# Skip library checks for faster iteration (not recommended for CI)
tsc --skipLibCheck --noEmit
```

### ESLint Errors

```bash
# Try auto-fixing first
yarn lint:fix

# Check specific files
yarn lint --file path/to/file.tsx
```

### Prettier Issues

```bash
# Auto-fix all formatting issues
yarn prettier

# Check specific files
npx prettier --check "src/**/*.tsx"
```

## CI/CD Integration

These scripts are designed to be used in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run all checks
  run: yarn test:all

# Example with individual steps
- name: Jest Tests
  run: yarn test
- name: TypeScript Check
  run: yarn check-types
- name: ESLint
  run: yarn lint
- name: Prettier Check
  run: yarn prettier:check
```

## Performance Tips

### Faster Type Checking

```bash
# Skip lib checks (faster, but less thorough)
tsc --skipLibCheck --noEmit
```

### Parallel Execution

The batch scripts run sequentially for clarity, but you can run checks in parallel:

```bash
# Run all checks in parallel (bash/zsh)
yarn test & yarn check-types & yarn lint & yarn prettier:check
wait

# Or use npm-run-all (requires package)
npm-run-all --parallel test check-types lint prettier:check
```

### Selective Checks

```bash
# Only run checks for changed files
git diff --name-only --cached | grep -E '\.(ts|tsx|js|jsx)$' | xargs yarn eslint
```

## Files

- `run-all-checks.bat` - Windows batch script (check only)
- `run-all-checks-fix.bat` - Windows batch script (auto-fix) ⭐
- `run-all-checks.sh` - Unix/Linux shell script (check only)
- `package.json` - Contains all test scripts
- `.lintstagedrc.js` - Lint-staged configuration (not used, hooks disabled)
- `.husky/pre-commit` - Pre-commit hook (disabled)

## Notes

- All scripts have colored output for better readability
- Scripts exit with non-zero code on failure (CI-friendly)
- Progress indicators show which check is running
- Summary at the end shows overall pass/fail status
