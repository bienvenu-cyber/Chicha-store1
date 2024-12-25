#!/usr/bin/env python3

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

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

        # Création du message de test
        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = ', '.join(recipient_emails)
        message['Subject'] = 'Test de configuration monitoring Chicha Store'

        body = """
        Ceci est un email de test pour vérifier la configuration 
        du système de monitoring de Chicha Store.

        Si vous recevez cet email, la configuration est réussie !
        """
        message.attach(MIMEText(body, 'plain'))

        # Création du contexte SSL
        context = ssl.create_default_context()

        # Tentative de connexion et d'envoi
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls(context=context)
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_emails, message.as_string())

        print("✅ Configuration email réussie !")
        print(f"Serveur SMTP : {smtp_server}")
        print(f"Email expéditeur : {sender_email}")
        print(f"Destinataires : {', '.join(recipient_emails)}")
        return True

    except Exception as e:
        print(f"❌ Échec de la configuration email : {e}")
        return False

if __name__ == '__main__':
    test_email_configuration()
