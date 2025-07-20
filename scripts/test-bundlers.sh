#!/bin/bash

# Bundler Integration Test Runner
# This script runs the bundler integration tests

set -e

echo "🚀 Starting Bundler Integration Tests"
echo "======================================"

cd "$(dirname "$0")/../tests/bundlers"

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Test each bundler individually
echo ""
echo "🎯 Testing Webpack..."
if npm run test:webpack; then
    echo "✅ Webpack test passed"
else
    echo "❌ Webpack test failed"
    exit 1
fi

echo ""
echo "🎯 Testing ESBuild..."
if npm run test:esbuild; then
    echo "✅ ESBuild test passed"
else
    echo "❌ ESBuild test failed"
    exit 1
fi

echo ""
echo "🎯 Testing Rollup..."
if npm run test:rollup; then
    echo "✅ Rollup test passed"
else
    echo "❌ Rollup test failed"
    exit 1
fi

echo ""
echo "🎉 All bundler integration tests passed!"
echo "========================================"
