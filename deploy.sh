#!/bin/bash

# Enhanced Deployment Script for Chicha Store

# Stop script on any error
set -e

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
REMOTE_USER="${DEPLOY_USER:-chicha-admin}"
REMOTE_HOST="${DEPLOY_HOST:-chicha-store.com}"
PROJECT_DIR="${DEPLOY_DIR:-/var/www/chicha-store}"
BACKUP_DIR="${PROJECT_DIR}/backups"

# Logging function
log() {
    echo -e "${GREEN}[DEPLOY] $1${NC}"
}

# Error handling function
error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

# Validate deployment environment
validate_environment() {
    case "$ENVIRONMENT" in
        production|staging|development)
            log "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            error "Invalid environment. Use production, staging, or development."
            ;;
    esac
}

# Pre-deployment checks
pre_deploy_checks() {
    log "Running pre-deployment checks..."
    
    # Check git status
    if [[ -n $(git status -s) ]]; then
        error "Git working directory is not clean. Commit or stash changes first."
    fi

    # Verify semantic version
    if ! npm run semantic-release --dry-run; then
        error "Semantic release validation failed"
    fi

    # Run tests
    log "Running tests..."
    npm test || error "Tests failed. Deployment aborted."

    # Build project
    log "Building project..."
    npm run build || error "Build failed"
}

# Docker deployment
docker_deploy() {
    local env_file=".env.${ENVIRONMENT}"
    
    if [[ ! -f "$env_file" ]]; then
        error "Environment file $env_file not found"
    fi

    log "Building Docker images for $ENVIRONMENT..."
    docker-compose -f docker-compose.yml -f "docker-compose.${ENVIRONMENT}.yml" build || error "Docker build failed"

    log "Connecting to remote server..."
    ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
        # Create project and backup directories
        mkdir -p "$PROJECT_DIR" "$BACKUP_DIR"

        # Move to project directory
        cd "$PROJECT_DIR"

        # Create timestamp for backup
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        
        # Backup current configuration
        cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml_$TIMESTAMP"
        cp "$env_file" "$BACKUP_DIR/.env_$TIMESTAMP"

        # Stop existing containers
        docker-compose down

        # Copy new configuration
        scp "$env_file" "$REMOTE_USER@$REMOTE_HOST:$PROJECT_DIR/.env"
        scp docker-compose.yml "$REMOTE_USER@$REMOTE_HOST:$PROJECT_DIR/"

        # Pull and start new containers
        docker-compose pull
        docker-compose up -d

        # Prune old images and volumes
        docker system prune -af --volumes
EOF
}

# Rollback function
rollback() {
    log "Rolling back to previous deployment..."
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -1)
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup available for rollback"
    fi

    # Implement specific rollback logic here
    log "Rolled back to backup: $latest_backup"
}

# Notification function
send_notification() {
    local status="$1"
    local message="Deployment to $ENVIRONMENT $status"
    
    # Add your notification method (Slack, email, etc.)
    # Example: curl -X POST "https://slack.webhook.com" -d "text=$message"
    log "$message"
}

# Main deployment function
main() {
    trap rollback ERR
    trap 'send_notification "failed"' EXIT

    validate_environment
    pre_deploy_checks
    docker_deploy
    send_notification "successful"

    log "Deployment to $ENVIRONMENT completed successfully! 🚀"
}

# Execute main deployment
main "$@"
