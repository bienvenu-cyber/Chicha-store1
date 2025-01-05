#!/bin/bash

# Script de monitoring et maintenance

# Journalisation
LOG_FILE="/var/log/chicha-store/monitor.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Fonction de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Vérification des services
check_services() {
    log "🔍 Vérification des services..."
    
    # Vérification du backend
    if ! pm2 describe chicha-backend > /dev/null 2>&1; then
        log "❌ Backend arrêté. Redémarrage en cours..."
        pm2 start /path/to/backend/server.js --name chicha-backend
    fi

    # Vérification de MongoDB
    if ! systemctl is-active --quiet mongod; then
        log "❌ MongoDB arrêté. Redémarrage en cours..."
        sudo systemctl restart mongod
    fi

    # Vérification de Nginx
    if ! systemctl is-active --quiet nginx; then
        log "❌ Nginx arrêté. Redémarrage en cours..."
        sudo systemctl restart nginx
    fi
}

# Nettoyage des logs et des fichiers temporaires
cleanup() {
    log "🧹 Nettoyage des fichiers temporaires..."
    
    # Supprimer les logs de plus de 30 jours
    find /var/log/chicha-store -type f -mtime +30 -delete
    
    # Nettoyer le cache npm
    npm cache clean --force
    
    # Nettoyer les fichiers temporaires
    find /tmp -type f -atime +7 -delete
}

# Sauvegarde de la base de données
backup_database() {
    BACKUP_DIR="/backup/chicha-store/$(date +'%Y-%m-%d')"
    mkdir -p "$BACKUP_DIR"
    
    log "💾 Sauvegarde de la base de données..."
    mongodump --uri="mongodb://localhost/chicha_store" --out="$BACKUP_DIR"
    
    # Compression de la sauvegarde
    tar -czvf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
    rm -rf "$BACKUP_DIR"
}

# Exécution principale
main() {
    log "🚀 Début du monitoring et de la maintenance"
    
    check_services
    cleanup
    backup_database
    
    log "✅ Monitoring et maintenance terminés"
}

# Exécuter le script
main
