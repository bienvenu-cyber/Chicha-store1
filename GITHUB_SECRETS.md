# Configuration des Secrets GitHub

## Secrets Requis pour le Workflow CI/CD

### 1. Secrets de Déploiement
- `DEPLOY_HOST`: Adresse IP ou nom de domaine du serveur de production
- `DEPLOY_USER`: Nom d'utilisateur SSH pour le déploiement
- `SSH_PRIVATE_KEY`: Clé privée SSH pour l'authentification

### 2. Secrets de Sécurité
- `SNYK_TOKEN`: Token d'API Snyk pour les analyses de vulnérabilités

### 3. Secrets de Base de Données
- `PRODUCTION_MONGODB_URI`: URI de connexion à la base de données de production
- `TEST_MONGODB_URI`: URI de connexion à la base de données de test

### 4. Secrets d'Authentification
- `JWT_SECRET`: Clé secrète pour la génération des tokens JWT
- `ADMIN_PASSWORD`: Mot de passe administrateur initial

### 5. Secrets de Services Externes
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Comment Ajouter les Secrets

1. Allez sur votre dépôt GitHub
2. Cliquez sur "Settings"
3. Dans le menu de gauche, cliquez sur "Secrets and variables"
4. Sélectionnez "Actions"
5. Cliquez sur "New repository secret"
6. Ajoutez chaque secret individuellement

## Exemple de Configuration Sécurisée

```bash
# Générez une clé SSH
ssh-keygen -t ed25519 -C "deploiement-chicha-store"

# Créez un utilisateur de déploiement sur votre serveur
sudo adduser deployer
sudo usermod -aG sudo deployer

# Configurez l'accès SSH
sudo su - deployer
mkdir ~/.ssh
chmod 700 ~/.ssh
```

## Bonnes Pratiques

- Utilisez des secrets différents pour chaque environnement
- Régénérez régulièrement vos tokens et clés
- Limitez l'accès aux secrets
- Utilisez des gestionnaires de secrets comme HashiCorp Vault

---

*Dernière mise à jour : $(date +"%d/%m/%Y")*
