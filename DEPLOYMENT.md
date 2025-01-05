# Guide de Déploiement - Chicha Store

## Prérequis

### Serveur
- Ubuntu 20.04+ LTS
- Minimum 2 Go RAM
- 20 Go d'espace disque

### Logiciels
- Node.js 16+ 
- npm 8+
- MongoDB 4.4+
- Nginx
- PM2
- Certbot

## Installation

### 1. Mise à jour système
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation des dépendances
```bash
# Node.js et npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Certbot
sudo snap install --classic certbot
```

### 3. Configuration du projet
```bash
git clone https://github.com/votre-repo/chicha-store.git
cd chicha-store

# Installation des dépendances
npm run setup

# Configuration des variables d'environnement
cp .env.example .env
# Éditez le fichier .env avec vos configurations
```

### 4. Déploiement
```bash
# Exécutez le script de déploiement
./deploy.sh
```

### 5. Configuration SSL
```bash
# Générez les certificats
sudo ./generate-ssl.sh
```

## Maintenance

### Monitoring
```bash
# Surveillance des services
./monitor.sh

# Logs PM2
pm2 logs
```

### Mises à jour
```bash
git pull origin main
./deploy.sh
```

## Sécurité

- Mettez régulièrement à jour le système
- Utilisez des mots de passe forts
- Configurez un pare-feu (UFW)
- Utilisez fail2ban

## Dépannage

- Vérifiez les logs : `/var/log/chicha-store/`
- Redémarrez les services : `pm2 restart all`

---

*Dernière mise à jour : $(date +"%d/%m/%Y")*
