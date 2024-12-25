#!/bin/bash

# Script de monitoring avancé pour Chicha Store

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"
HEALTH_CHECK_URL="https://chicha-store.com/health"
ERROR_LOG_PATH="/var/log/chicha-store/error.log"
PERFORMANCE_LOG_PATH="/var/log/chicha-store/performance.log"

# Fonction d'envoi de notification Slack
send_slack_notification() {
    local message="$1"
    local color="$2"  # good, warning, danger

    payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "title": "Chicha Store - Monitoring Alert",
        "text": "$message",
        "footer": "Monitoring Script",
        "ts": $(date +%s)
    }]
}
EOF
)

    curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL"
}

# Vérification de la santé du site
check_site_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL")
    
    if [ "$response" -ne 200 ]; then
        send_slack_notification "Site Unavailable! HTTP Status: $response" "danger"
    fi
}

# Analyse des logs d'erreurs
check_error_logs() {
    local recent_errors=$(tail -n 50 "$ERROR_LOG_PATH" | grep -E "ERROR|CRITICAL")
    
    if [ ! -z "$recent_errors" ]; then
        send_slack_notification "Recent Errors Detected:\n$recent_errors" "warning"
    fi
}

# Vérification des performances
check_performance() {
    local avg_response_time=$(awk '{sum+=$1} END {print sum/NR}' "$PERFORMANCE_LOG_PATH")
    
    if (( $(echo "$avg_response_time > 1000" | bc -l) )); then
        send_slack_notification "High Response Time: $avg_response_time ms" "warning"
    fi
}

# Vérification de l'espace disque
check_disk_space() {
    local disk_usage=$(df -h / | awk '/\// {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 80 ]; then
        send_slack_notification "Disk Space Low: $disk_usage% used" "warning"
    fi
}

# Vérification de la charge du système
check_system_load() {
    local load=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | tr -d ' ')
    local cores=$(nproc)
    local load_percentage=$(echo "scale=2; ($load / $cores) * 100" | bc)
    
    if (( $(echo "$load_percentage > 80" | bc -l) )); then
        send_slack_notification "High System Load: $load_percentage%" "warning"
    fi
}

# Exécution des vérifications
main() {
    check_site_health
    check_error_logs
    check_performance
    check_disk_space
    check_system_load
}

main
