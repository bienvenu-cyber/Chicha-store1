#!/bin/bash

# Script de monitoring avancé pour Chicha Store

# Configuration des notifications
NOTIFICATION_METHOD="${NOTIFICATION_METHOD:-discord}" # discord, telegram, email, etc.
NOTIFICATION_WEBHOOK="${NOTIFICATION_WEBHOOK}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@chicha-store.com}"

# Chemins de logs
HEALTH_LOG="/var/log/chicha-store/health.log"
ERROR_LOG="/var/log/chicha-store/error.log"
PERFORMANCE_LOG="/var/log/chicha-store/performance.log"

# Fonction générique d'envoi de notification
send_notification() {
    local message="$1"
    local severity="${2:-info}" # info, warning, critical

    case "$NOTIFICATION_METHOD" in
        "discord")
            send_discord_notification "$message" "$severity"
            ;;
        "telegram")
            send_telegram_notification "$message" "$severity"
            ;;
        "email")
            send_email_notification "$message" "$severity"
            ;;
        *)
            echo "Méthode de notification non supportée"
            ;;
    esac
}

# Notification Discord
send_discord_notification() {
    local message="$1"
    local severity="$2"
    local color

    case "$severity" in
        "critical") color=16711680 ;; # Rouge
        "warning")  color=16776960 ;; # Jaune
        *)          color=65280     ;; # Vert
    esac

    payload=$(cat <<EOF
{
    "embeds": [{
        "title": "Chicha Store - Monitoring Alert",
        "description": "$message",
        "color": $color,
        "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    }]
}
EOF
)

    curl -X POST -H "Content-Type: application/json" -d "$payload" "$NOTIFICATION_WEBHOOK"
}

# Notification Telegram
send_telegram_notification() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
         -d "chat_id=${TELEGRAM_CHAT_ID}" \
         -d "text=$message"
}

# Notification Email
send_email_notification() {
    local message="$1"
    local subject="Chicha Store - Monitoring Alert"
    echo "$message" | mail -s "$subject" "$ADMIN_EMAIL"
}

# Vérifications système
check_system_health() {
    # Vérification de la disponibilité du site
    local http_status=$(curl -o /dev/null -s -w "%{http_code}" https://chicha-store.com)
    if [ "$http_status" -ne 200 ]; then
        send_notification "Site indisponible. Statut HTTP: $http_status" "critical"
    fi

    # Vérification de l'espace disque
    local disk_usage=$(df -h / | awk '/\// {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        send_notification "Espace disque critique : $disk_usage% utilisé" "critical"
    fi

    # Vérification de la charge système
    local load=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | tr -d ' ')
    local cores=$(nproc)
    local load_percentage=$(echo "scale=2; ($load / $cores) * 100" | bc)
    
    if (( $(echo "$load_percentage > 90" | bc -l) )); then
        send_notification "Charge système critique : $load_percentage%" "critical"
    fi
}

# Analyse des logs d'erreurs
check_error_logs() {
    # Recherche d'erreurs critiques dans les logs
    local critical_errors=$(grep -E "CRITICAL|ERROR" "$ERROR_LOG" | tail -n 10)
    
    if [ ! -z "$critical_errors" ]; then
        send_notification "Erreurs critiques détectées:\n$critical_errors" "critical"
    fi
}

# Vérification des performances
check_performance() {
    # Analyse du temps de réponse moyen
    local avg_response_time=$(awk '{sum+=$1} END {print sum/NR}' "$PERFORMANCE_LOG")
    
    if (( $(echo "$avg_response_time > 2000" | bc -l) )); then
        send_notification "Performances dégradées : temps de réponse moyen de $avg_response_time ms" "warning"
    fi
}

# Exécution des vérifications
main() {
    check_system_health
    check_error_logs
    check_performance
}

# Exécution du script
main
