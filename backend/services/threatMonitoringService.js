import axios from 'axios';
import geoip from 'geoip-lite';
import User from '../models/User.js.js';
import EmailNotificationService from './emailNotificationService.js.js.js';
import { performance } from 'perf_hooks';

export default class ThreatMonitoringService {
  constructor() {
    this.blacklistedIPs = new Set();
    this.suspiciousActivities = new Map();
    this.threatScoreThresholds = {
      low: 30,
      medium: 60,
      high: 80
    };
  }

  // Analyse IP et géolocalisation
  async analyzeIPReputation(ip) {
    try {
      // Utilisation d'une API externe pour vérifier la réputation de l'IP
      const response = await axios.get(`https://ipqualityscore.com/api/json/ip/${process.env.IP_REPUTATION_API_KEY}/${ip}`);
      const ipData = response.data;

      return {
        reputation: ipData.fraud_score,
        isTor: ipData.tor,
        isProxy: ipData.proxy,
        isVPN: ipData.vpn,
        country: ipData.country_code
      };
    } catch (error) {
      console.error('Erreur de vérification de réputation IP:', error);
      return null;
    }
  }

  // Détection de comportements anormaux
  async detectAnomalousActivity(user, activityData) {
    const threatScore = this.calculateThreatScore(activityData);

    if (threatScore >= this.threatScoreThresholds.medium) {
      await this.handleSuspiciousActivity(user, activityData, threatScore);
    }

    return threatScore;
  }

  calculateThreatScore(activityData) {
    let score = 0;

    // Facteurs augmentant le score de menace
    if (activityData.rapidRequests) score += 20;
    if (activityData.unusualGeoLocation) score += 25;
    if (activityData.multipleFailedLogins) score += 30;
    if (activityData.suspiciousDevice) score += 15;

    return Math.min(score, 100);
  }

  async handleSuspiciousActivity(user, activityData, threatScore) {
    // Enregistrement de l'activité suspecte
    this.logSuspiciousActivity(user, activityData);

    // Notification par email
    await EmailNotificationService.sendSecurityAlertEmail(user, 'suspicious_activity', {
      threatScore,
      details: JSON.stringify(activityData)
    });

    // Actions de mitigation
    if (threatScore >= this.threatScoreThresholds.high) {
      await this.mitigateHighThreatActivity(user, activityData);
    }
  }

  async mitigateHighThreatActivity(user, activityData) {
    // Blocage temporaire du compte
    user.status = 'suspended';
    user.lockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 heures
    await user.save();

    // Blacklisting de l'IP
    if (activityData.ip) {
      this.blacklistedIPs.add(activityData.ip);
    }
  }

  logSuspiciousActivity(user, activityData) {
    const activityLog = {
      userId: user._id,
      timestamp: new Date(),
      ...activityData
    };

    // Stockage en mémoire
    this.suspiciousActivities.set(user._id.toString(), activityLog);

    // TODO: Implémenter un stockage persistant (base de données)
  }

  // Analyse des requêtes réseau
  async analyzeNetworkRequest(req) {
    const startTime = performance.now();
    const clientIP = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(clientIP);

    const requestAnalysis = {
      ip: clientIP,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      geo: geo ? {
        country: geo.country,
        city: geo.city,
        timezone: geo.timezone
      } : null,
      timestamp: new Date()
    };

    const ipReputation = await this.analyzeIPReputation(clientIP);

    // Vérification des menaces potentielles
    const threatScore = this.calculateNetworkThreatScore(requestAnalysis, ipReputation);

    if (threatScore > this.threatScoreThresholds.low) {
      await this.handlePotentialThreat(requestAnalysis, ipReputation, threatScore);
    }

    const endTime = performance.now();
    requestAnalysis.processingTime = endTime - startTime;

    return requestAnalysis;
  }

  calculateNetworkThreatScore(requestAnalysis, ipReputation) {
    let score = 0;

    if (ipReputation) {
      score += ipReputation.reputation || 0;
      if (ipReputation.isTor) score += 30;
      if (ipReputation.isProxy) score += 25;
      if (ipReputation.isVPN) score += 20;
    }

    return Math.min(score, 100);
  }

  async handlePotentialThreat(requestAnalysis, ipReputation, threatScore) {
    // Logging détaillé
    console.warn('Menace potentielle détectée', {
      requestAnalysis,
      ipReputation,
      threatScore
    });

    // TODO: Intégrer avec un système de gestion des incidents
  }

  // Nettoyage périodique
  cleanupSuspiciousActivities() {
    const expirationTime = 24 * 60 * 60 * 1000; // 24 heures
    const now = Date.now();

    for (const [userId, activity] of this.suspiciousActivities) {
      if (now - activity.timestamp > expirationTime) {
        this.suspiciousActivities.delete(userId);
      }
    }
  }
}

export default new ThreatMonitoringService();
