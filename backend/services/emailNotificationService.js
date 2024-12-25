import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
const fs = require('fs').promises;
import path from 'path';

export default class EmailNotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.NODE_ENV === 'production',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.emailTemplatesDir = path.join(__dirname, '../templates/emails');
  }

  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(this.emailTemplatesDir, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error(`Erreur de chargement du template ${templateName}:`, error);
      throw error;
    }
  }

  async sendAccountActivationEmail(user) {
    try {
      const template = await this.loadTemplate('account-activation');
      const activationLink = `${process.env.FRONTEND_URL}/activate/${user.activationToken}`;

      const htmlContent = template({
        username: user.username,
        activationLink,
        supportEmail: 'support@chicha-store.com'
      });

      await this.sendEmail({
        to: user.email,
        subject: 'Activez votre compte Chicha Store',
        html: htmlContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'activation:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const template = await this.loadTemplate('password-reset');
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const htmlContent = template({
        username: user.username,
        resetLink,
        expirationTime: '1 heure'
      });

      await this.sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: htmlContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    }
  }

  async sendSecurityAlertEmail(user, alertType, details) {
    try {
      const template = await this.loadTemplate('security-alert');

      const htmlContent = template({
        username: user.username,
        alertType,
        details,
        timestamp: new Date().toLocaleString(),
        supportLink: 'https://chicha-store.com/support'
      });

      await this.sendEmail({
        to: user.email,
        subject: 'Alerte de Sécurité - Chicha Store',
        html: htmlContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte de sécurité:', error);
    }
  }

  async sendLoginNotificationEmail(user, loginDetails) {
    try {
      const template = await this.loadTemplate('login-notification');

      const htmlContent = template({
        username: user.username,
        ip: loginDetails.ip,
        location: loginDetails.location,
        device: loginDetails.device,
        timestamp: new Date().toLocaleString()
      });

      await this.sendEmail({
        to: user.email,
        subject: 'Nouvelle Connexion à Votre Compte',
        html: htmlContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de connexion:', error);
    }
  }

  async sendEmail(options) {
    const defaultOptions = {
      from: `Chicha Store <${process.env.EMAIL_FROM}>`
    };

    const mailOptions = { ...defaultOptions, ...options };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erreur d\'envoi d\'email:', error);
      throw error;
    }
  }

  // Méthode de test de configuration
  async verifyEmailConfiguration() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration email vérifiée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur de configuration email:', error);
      return false;
    }
  }
}

export default new EmailNotificationService();
