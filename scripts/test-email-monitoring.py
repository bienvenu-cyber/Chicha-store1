#!/usr/bin/env python3

import os
import sys
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import datetime
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/email_test.log')
    ]
)

# Charger les variables d'environnement
load_dotenv('.env.monitoring')

def test_email_configuration():
    try:
        # Récupération des paramètres
        smtp_server = os.getenv('EMAIL_SMTP_SERVER')
        smtp_port = int(os.getenv('EMAIL_SMTP_PORT'))
        sender_email = os.getenv('EMAIL_SENDER')
        sender_password = os.getenv('EMAIL_PASSWORD')
        recipient_emails = os.getenv('ADMIN_EMAILS', '').split(',')

        logging.info(f"Tentative de connexion à {smtp_server}")
        logging.info(f"Email expéditeur : {sender_email}")
        logging.info(f"Destinataire(s) : {recipient_emails}")

        # Création du message de test
        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = ', '.join(recipient_emails)
        message['Subject'] = f'Test de Monitoring Chicha Store - {datetime.datetime.now()}'

        body = f"""
        🚀 Test de Configuration de Monitoring Chicha Store

        Détails du test :
        - Date : {datetime.datetime.now()}
        - Serveur SMTP : {smtp_server}
        - Email expéditeur : {sender_email}
        - Destinataire(s) : {', '.join(recipient_emails)}

        Si vous recevez cet email, la configuration du système de monitoring 
        est réussie et fonctionnelle !

        Cordialement,
        Votre système de monitoring Chicha Store
        """
        message.attach(MIMEText(body, 'plain'))

        # Création du contexte SSL
        context = ssl.create_default_context()

        # Tentative de connexion et d'envoi
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()  # Identification initiale
            server.starttls(context=context)
            server.ehlo()  # Ré-identification après TLS
            
            logging.info("Tentative de login...")
            server.login(sender_email, sender_password)
            
            logging.info("Envoi de l'email...")
            server.sendmail(sender_email, recipient_emails, message.as_string())

        logging.info("✅ Configuration email réussie !")
        return True

    except Exception as e:
        logging.error(f"❌ Échec de la configuration email : {e}")
        logging.error(f"Type d'erreur : {type(e)}")
        return False

def main():
    success = test_email_configuration()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
