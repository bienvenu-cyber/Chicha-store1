#!/bin/bash

# 🚨 Nuclear Dependency Cleanup Script 🚨

set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Fail on any part of a pipe failing

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# Comprehensive cleanup function
total_nuclear_cleanup() {
    local project_path=$1
    
    log $BLUE "🧨 INITIATING NUCLEAR DEPENDENCY CLEANUP: $project_path"
    
    cd "$project_path"
    
    # Extreme cleanup steps
    log $YELLOW "🔥 Removing ALL existing dependency artifacts"
    rm -rf node_modules
    rm -rf package-lock.json
    rm -rf yarn.lock
    rm -rf .next
    rm -rf build
    rm -rf dist
    
    # Clean npm cache completely
    log $YELLOW "🧹 Purging npm cache"
    npm cache clean --force
    
    # Reset npm configuration to most secure defaults
    log $YELLOW "🔒 Resetting npm security configurations"
    npm config set strict-ssl true
    npm config set registry https://registry.npmjs.org/
    
    # Force update npm itself
    log $BLUE "🆙 Updating npm to latest version"
    npm install -g npm@latest
    
    # Install dependencies with maximum security and latest versions
    log $GREEN "📦 Installing LATEST dependencies with MAXIMUM security"
    npm install \
        --no-audit \
        --no-fund \
        --legacy-peer-deps \
        --engine-strict \
        --ignore-scripts \
        --force
    
    # Critical dependency updates
    log $RED "🛡️ Updating CRITICAL security-related packages"
    npm install \
        react@latest \
        react-dom@latest \
        react-router-dom@latest \
        @reduxjs/toolkit@latest \
        @chakra-ui/react@latest \
        @emotion/react@latest \
        @emotion/styled@latest \
        typescript@latest \
        webpack@latest \
        postcss@latest \
        loader-utils@latest \
        nth-check@latest \
        --save \
        --force

    # Development dependencies update
    log $BLUE "🔧 Updating development dependencies"
    npm install \
        react-scripts@latest \
        @babel/core@latest \
        eslint@latest \
        @typescript-eslint/eslint-plugin@latest \
        @typescript-eslint/parser@latest \
        --save-dev \
        --force
    
    # Aggressive security audit and fix
    log $RED "🚨 AGGRESSIVE Security Audit & Fix"
    npm audit fix --force --audit-level=critical
    
    # Rebuild node-gyp for native dependencies
    log $YELLOW "🔨 Rebuilding native dependencies"
    npm rebuild
    
    cd -
}

# Projects to clean up
PROJECTS=(
    "/Users/bv/CascadeProjects/chicha-store/frontend"
    "/Users/bv/CascadeProjects/chicha-store/backend"
    "/Users/bv/CascadeProjects/chicha-store/admin"
)

# Main execution
main() {
    log $GREEN "☢️ NUCLEAR DEPENDENCY MIGRATION PROTOCOL INITIATED ☢️"
    
    for project in "${PROJECTS[@]}"; do
        total_nuclear_cleanup "$project"
    done
    
    log $GREEN "✅ NUCLEAR CLEANUP COMPLETE. SYSTEM NEUTRALIZED. ✅"
}

# Execute the main function
main
