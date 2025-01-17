#!/usr/bin/env python3

import os
import sys
import psutil
import socket
import smtplib
import ssl
import requests
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from datetime import datetime
import subprocess
import platform
ImportWarning
ImportError

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/chicha_store_monitoring.log')
    ]
)

# Charger les variables d'environnement
load_dotenv('/Users/bv/CascadeProjects/chicha-store/scripts/.env.monitoring')

class ChichaStoreMonitoring:
    def __init__(self):
        # Paramètres de configuration
        self.smtp_server = os.getenv('EMAIL_SMTP_SERVER')
        self.smtp_port = int(os.getenv('EMAIL_SMTP_PORT'))
        self.sender_email = os.getenv('EMAIL_SENDER')
        self.sender_password = os.getenv('EMAIL_PASSWORD')
        self.admin_emails = os.getenv('ADMIN_EMAILS', '').split(',')
        self.website_url = os.getenv('MONITORING_WEBSITE_URL')
        
        # Seuils de surveillance
        self.disk_space_critical = int(os.getenv('DISK_SPACE_CRITICAL_THRESHOLD', 90))
        self.disk_space_warning = int(os.getenv('DISK_SPACE_WARNING_THRESHOLD', 80))
        self.system_load_critical = int(os.getenv('SYSTEM_LOAD_CRITICAL_THRESHOLD', 90))
        self.system_load_warning = int(os.getenv('SYSTEM_LOAD_WARNING_THRESHOLD', 70))

    def check_disk_space(self):
        """Vérification de l'espace disque"""
        disk_usage = psutil.disk_usage('/')
        disk_percent = disk_usage.percent
        
        status = "NORMAL"
        if disk_percent >= self.disk_space_critical:
            status = "CRITICAL"
        elif disk_percent >= self.disk_space_warning:
            status = "WARNING"
        
        return {
            'percent': disk_percent,
            'total': disk_usage.total / (1024 * 1024 * 1024),  # Go
            'free': disk_usage.free / (1024 * 1024 * 1024),    # Go
            'status': status
        }

    def check_system_load(self):
        """Vérification de la charge système"""
        load_avg = os.getloadavg()[0]  # Charge moyenne sur 1 minute
        num_cores = psutil.cpu_count()
        load_percent = (load_avg / num_cores) * 100
        
        status = "NORMAL"
        if load_percent >= 90:  # Seuil critique plus élevé
            status = "CRITICAL"
        elif load_percent >= 70:  # Seuil d'avertissement plus élevé
            status = "WARNING"
        
        return {
            'load_avg': load_avg,
            'num_cores': num_cores,
            'load_percent': load_percent,
            'status': status
        }

    def check_website_status(self):
        """Vérification du statut du site web local"""
        try:
            # Vérification de localhost
            response = requests.get(self.website_url, timeout=5)
            return {
                'status_code': response.status_code,
                'is_online': 200 <= response.status_code < 400,
                'response_time': response.elapsed.total_seconds(),
                'local_server': True
            }
        except requests.RequestException as e:
            return {
                'status_code': None,
                'is_online': False,
                'local_server': False,
                'error': str(e)
            }

    def check_docker_containers(self):
        """Vérification des conteneurs Docker"""
        try:
            result = subprocess.run(['docker', 'ps', '-q'], capture_output=True, text=True)
            containers = result.stdout.strip().split('\n')
            return {
                'total_containers': len(containers),
                'running_containers': len(containers)
            }
        except Exception as e:
            return {
                'error': str(e),
                'total_containers': 0,
                'running_containers': 0
            }

    def send_email_alert(self, subject, body):
        """Envoi d'un email d'alerte"""
        try:
            message = MIMEMultipart()
            message['From'] = self.sender_email
            message['To'] = ', '.join(self.admin_emails)
            message['Subject'] = subject
            message.attach(MIMEText(body, 'plain'))

            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, self.admin_emails, message.as_string())
            
            logging.info(f"Email alert sent: {subject}")
        except Exception as e:
            logging.error(f"Failed to send email alert: {e}")

    def generate_system_report(self):
        """Génération d'un rapport système complet"""
        disk_info = self.check_disk_space()
        load_info = self.check_system_load()
        website_status = self.check_website_status()
        docker_info = self.check_docker_containers()

        report = f"""🚨 Rapport de Monitoring Chicha Store 🚨
Date: {datetime.now()}
Système: {platform.platform()}

📊 Espace Disque:
- Utilisation: {disk_info['percent']}%
- Total: {disk_info['total']:.2f} Go
- Libre: {disk_info['free']:.2f} Go
- Statut: {disk_info['status']}

💻 Charge Système:
- Charge moyenne: {load_info['load_avg']}
- Nombre de cœurs: {load_info['num_cores']}
- Charge en %: {load_info['load_percent']:.2f}%
- Statut: {load_info['status']}

🌐 Serveur Local:
- URL: {self.website_url}
- Statut: {'En ligne' if website_status.get('is_online', False) else 'Hors ligne'}
- Serveur local: {'Actif' if website_status.get('local_server', False) else 'Inactif'}
- Code de réponse: {website_status.get('status_code', 'N/A')}
- Temps de réponse: {website_status.get('response_time', 'N/A')} sec
- Erreur: {website_status.get('error', 'Aucune')}

🐳 Conteneurs Docker:
- Total: {docker_info['total_containers']}
- En cours d'exécution: {docker_info['running_containers']}
"""
        return report

    def check_and_alert(self):
        """Vérification principale avec alertes"""
        disk_info = self.check_disk_space()
        load_info = self.check_system_load()
        website_status = self.check_website_status()

        # Alertes critiques
        if disk_info['status'] != 'NORMAL':
            subject = f"🚨 ALERTE ESPACE DISQUE - {disk_info['status']}"
            self.send_email_alert(subject, self.generate_system_report())

        if load_info['status'] != 'NORMAL':
            subject = f"🚨 ALERTE CHARGE SYSTÈME - {load_info['status']}"
            self.send_email_alert(subject, self.generate_system_report())

        # Alerte pour le serveur local
        if not website_status.get('is_online', False):
            subject = "🚨 SERVEUR LOCAL INACCESSIBLE"
            self.send_email_alert(subject, self.generate_system_report())

        # Rapport périodique
        logging.info("Monitoring check completed successfully")
        
        # Envoi d'un rapport périodique une fois par jour
        current_hour = datetime.now().hour
        if current_hour == 0:  # À minuit
            subject = "📋 Rapport Système Quotidien Chicha Store"
            self.send_email_alert(subject, self.generate_system_report())

def main():
    monitoring = ChichaStoreMonitoring()
    monitoring.check_and_alert()

if __name__ == '__main__':
    main()
