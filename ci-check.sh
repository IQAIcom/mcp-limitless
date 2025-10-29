#!/bin/bash

# CI Check Script
# Runs the same checks as GitHub Actions CI locally
# Note: Integration tests are skipped - they only run on main branch in CI

set -e  # Exit on error

echo "🔍 Running CI checks locally..."
echo ""

echo "📋 Step 1/4: Code quality (lint, format, imports)..."
pnpm run format:check
echo "✅ Code quality checks passed"
echo ""

echo "📋 Step 2/4: Unit tests..."
pnpm test:unit
echo "✅ Unit tests passed"
echo ""

echo "📋 Step 3/4: Building..."
pnpm run build
echo "✅ Build passed"
echo ""

echo "📋 Step 4/4: Coverage (unit tests only)..."
pnpm test:unit --coverage
echo "✅ Coverage generated"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All CI checks passed! Ready to push. 🚀"
echo "ℹ️  Integration tests skipped (run manually with: pnpm test:integration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
