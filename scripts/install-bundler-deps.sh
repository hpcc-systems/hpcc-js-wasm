#!/bin/bash

# Install bundler test dependencies
echo "Installing bundler test dependencies..."

# Install test workspace dependencies
npm install --workspace=tests/bundlers

echo "Bundler test setup complete!"
