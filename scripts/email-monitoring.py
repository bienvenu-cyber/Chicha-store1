#!/usr/bin/env python3

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import subprocess
import json
from datetime import datetime

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    filename='/var/log/chicha-store/email-monitoring.log'
)

class EmailMonitoring:
    def __init__(self):
        # Configuration de l'email
        self.smtp_server = os.getenv('EMAIL_SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('EMAIL_SMTP_PORT', 587))
        self.sender_email = os.getenv('EMAIL_SENDER', 'monitoring@chicha-store.com')
        self.sender_password = os.getenv('EMAIL_PASSWORD', '')
        self.recipient_emails = os.getenv('ADMIN_EMAILS', '').split(',')
        
        # Configuration SSL/TLS
        self.context = ssl.create_default_context()

    def send_monitoring_email(self, subject, body, severity='info'):
        """Envoi d'un email de monitoring"""
        try:
            # Création du message
            message = MIMEMultipart()
            message['From'] = self.sender_email
            message['To'] = ', '.join(self.recipient_emails)
            message['Subject'] = f"[{severity.upper()}] {subject}"

            # Corps de l'email avec du HTML
            html_body = f"""
            <html>
                <body>
                    <h2>Chicha Store - Monitoring Alert</h2>
                    <p><strong>Severity:</strong> {severity.upper()}</p>
                    <p><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <pre>{body}</pre>
                    <hr>
                    <small>Sent by Chicha Store Monitoring System</small>
                </body>
            </html>
            """
            
            message.attach(MIMEText(html_body, 'html'))

            # Connexion et envoi
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=self.context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(
                    self.sender_email, 
                    self.recipient_emails, 
                    message.as_string()
                )
            
            logging.info(f"Email envoyé : {subject}")

        except Exception as e:
            logging.error(f"Erreur d'envoi d'email : {e}")

    def check_system_health(self):
        """Vérifications système"""
        checks = [
            self._check_disk_space(),
            self._check_system_load(),
            self._check_website_status()
        ]
        
        critical_checks = [check for check in checks if check['severity'] == 'critical']
        warning_checks = [check for check in checks if check['severity'] == 'warning']
        
        if critical_checks:
            self.send_monitoring_email(
                "Alertes Critiques Système", 
                json.dumps(critical_checks, indent=2),
                'critical'
            )
        
        if warning_checks:
            self.send_monitoring_email(
                "Alertes Système", 
                json.dumps(warning_checks, indent=2),
                'warning'
            )

    def _check_disk_space(self):
        """Vérification de l'espace disque"""
        try:
            result = subprocess.run(['df', '-h', '/'], capture_output=True, text=True)
            usage = int(result.stdout.split('\n')[1].split()[4].rstrip('%'))
            
            if usage > 90:
                return {
                    'check': 'Disk Space',
                    'value': f'{usage}%',
                    'severity': 'critical',
                    'message': 'Espace disque critique'
                }
            elif usage > 80:
                return {
                    'check': 'Disk Space',
                    'value': f'{usage}%',
                    'severity': 'warning',
                    'message': 'Espace disque presque saturé'
                }
            return None
        except Exception as e:
            logging.error(f"Erreur vérification espace disque : {e}")
            return None

    def _check_system_load(self):
        """Vérification de la charge système"""
        try:
            result = subprocess.run(['uptime'], capture_output=True, text=True)
            load = float(result.stdout.split('load average:')[1].split(',')[0].strip())
            cores = int(subprocess.run(['nproc'], capture_output=True, text=True).stdout.strip())
            load_percentage = (load / cores) * 100
            
            if load_percentage > 90:
                return {
                    'check': 'System Load',
                    'value': f'{load_percentage:.2f}%',
                    'severity': 'critical',
                    'message': 'Charge système critique'
                }
            elif load_percentage > 70:
                return {
                    'check': 'System Load',
                    'value': f'{load_percentage:.2f}%',
                    'severity': 'warning',
                    'message': 'Charge système élevée'
                }
            return None
        except Exception as e:
            logging.error(f"Erreur vérification charge système : {e}")
            return None

    def _check_website_status(self):
        """Vérification du statut du site web"""
        try:
            result = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://chicha-store.com'], capture_output=True, text=True)
            status_code = int(result.stdout)
            
            if status_code != 200:
                return {
                    'check': 'Website Status',
                    'value': str(status_code),
                    'severity': 'critical',
                    'message': 'Site web indisponible'
                }
            return None
        except Exception as e:
            logging.error(f"Erreur vérification site web : {e}")
            return None

def main():
    monitoring = EmailMonitoring()
    monitoring.check_system_health()

if __name__ == "__main__":
    main()
