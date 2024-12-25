# Configuration d'un mot de passe d'application Gmail

## Étapes pour générer un mot de passe d'application

1. Connectez-vous à votre compte Google
2. Accédez à [Gestion du compte Google](https://myaccount.google.com/)
3. Naviguez vers "Sécurité"
4. Sous "Connexion à Google", activez la "Vérification en deux étapes" si ce n'est pas déjà fait
5. Après activation, recherchez "Mots de passe d'application"
6. Sélectionnez "Autre (nom personnalisé)" et nommez l'application "Chicha Store Monitoring"
7. Google générera un mot de passe à 16 caractères
8. Copiez ce mot de passe dans le fichier `.env.monitoring`

## Précautions de sécurité
- Ne partagez jamais ce mot de passe
- Régénérez-le si vous suspectez une compromission
- Utilisez un gestionnaire de secrets pour le stocker de manière sécurisée

## Alternatives
- SendGrid
- Amazon SES
- Office 365
