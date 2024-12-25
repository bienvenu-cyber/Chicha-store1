import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import CryptographyService from '../services/cryptographyService.js.js';
import IntrusionDetectionService from '../services/intrusionDetectionService.js.js';
import ComplianceAuditService from '../services/complianceAuditService.js.js';

export default {
  // Configuration Helmet pour sécurité HTTP
  helmetConfig: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
        connectSrc: ["'self'", 'api.chicha-store.com']
      }
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Configuration CORS
  corsOptions: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://chicha-store.com',
        'http://localhost:3000',
        /\.chicha-store\.com$/
      ];

      if (!origin || allowedOrigins.some(allowed => 
        typeof allowed === 'string' 
          ? allowed === origin 
          : allowed.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Origine non autorisée'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true,
    maxAge: 3600
  },

  // Configuration de limitation de débit
  rateLimitConfig: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // Limitation dynamique basée sur le type de requête
      if (req.path.includes('/login')) return 5;
      if (req.path.includes('/register')) return 3;
      return 100; // Défaut
    },
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: 'Limite de requêtes dépassée. Veuillez patienter.',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60)
      });
    }
  },

  // Configuration de protection CSRF
  csrfProtection: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  },

  // Configuration des en-têtes de sécurité personnalisés
  customSecurityHeaders: {
    'X-Powered-By': 'Chicha Store Security',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  },

  // Configuration de journalisation de sécurité
  securityLogging: {
    logFailedLogins: true,
    logSuspiciousActivities: true,
    sensitiveFieldsMask: ['password', 'token', 'secret']
  },

  // Configuration de détection d'intrusion
  intrusionDetection: {
    enableBlacklisting: true,
    blacklistDuration: 24 * 60 * 60 * 1000, // 24 heures
    suspiciousThreshold: {
      failedLogins: 5,
      rapidRequests: 50
    }
  },

  // Configuration de sécurité avancée
  advancedSecurity: {
    // Stratégie de chiffrement
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotationFrequency: '30d',
      sensitiveFields: [
        'password', 
        'paymentInfo', 
        'personalDetails'
      ]
    },

    // Politique de gestion des clés
    keyManagement: {
      method: 'vault',
      provider: 'hashicorp',
      autoRotation: true,
      backupStrategy: 'encrypted_backup'
    },

    // Configuration de détection d'intrusion
    intrusionDetection: {
      enableSnortRules: true,
      enableSuricataRules: true,
      honeypotPorts: [22, 3306, 5432],
      threatIntelligenceSource: 'alienvault'
    },

    // Politique de conformité
    complianceRules: {
      gdpr: {
        dataMinimization: true,
        consentManagement: true,
        rightToErase: true
      },
      pci_dss: {
        encryptSensitiveData: true,
        accessControl: true,
        regularSecurityTests: true
      }
    },

    // Configuration des audits
    auditSettings: {
      frequency: 'daily',
      retentionPeriod: '90d',
      criticalIssueThreshold: 3
    },

    // Politique de gestion des accès
    accessControl: {
      roleBasedAccess: true,
      multiFactorAuthentication: true,
      sessionManagement: {
        maxConcurrentSessions: 3,
        sessionTimeout: '1h'
      }
    },

    // Protection contre les attaques
    attackMitigation: {
      rateLimiting: {
        loginAttempts: 5,
        lockoutDuration: '15m'
      },
      bruteForceProtection: true,
      sqlInjectionProtection: true,
      xssProtection: true
    }
  },

  // Initialisation des services de sécurité
  async initializeSecurityServices() {
    try {
      // Rotation des clés de chiffrement
      await CryptographyService.rotateEncryptionKey();

      // Initialisation des règles de détection d'intrusion
      await IntrusionDetectionService.initializeRules();

      // Génération du rapport de conformité
      const complianceReport = await ComplianceAuditService.generateComplianceReport();

      console.log('🔒 Services de sécurité initialisés avec succès');
      console.log('📊 Rapport de conformité généré:', complianceReport);

      return {
        encryptionKeyRotated: true,
        intrusionRulesLoaded: true,
        complianceReportGenerated: true
      };
    } catch (error) {
      console.error('❌ Erreur d\'initialisation des services de sécurité:', error);
      throw error;
    }
  },

  // Méthode de vérification de la configuration
  async validateSecurityConfiguration() {
    const checks = [
      { 
        name: 'Chiffrement', 
        check: async () => await CryptographyService.verifyEncryptionSetup() 
      },
      { 
        name: 'Détection d\'intrusion', 
        check: async () => await IntrusionDetectionService.validateRulesets() 
      },
      { 
        name: 'Conformité', 
        check: async () => await ComplianceAuditService.runComplianceCheck() 
      }
    ];

    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          const result = await check.check();
          return { 
            name: check.name, 
            passed: result 
          };
        } catch (error) {
          return { 
            name: check.name, 
            passed: false, 
            error: error.message 
          };
        }
      })
    );

    const overallStatus = results.every(result => result.passed);

    return {
      overallStatus,
      checks: results
    };
  }
};
