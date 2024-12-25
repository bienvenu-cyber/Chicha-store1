import crypto from 'crypto';
import { promisify } from 'util';
import scrypt from 'scrypt-js';
import argon2 from 'argon2';
import NodeVault from 'node-vault';

export default class CryptographyService {
  constructor() {
    // Configuration du coffre-fort de clés
    this.vault = NodeVault({
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN
    });

    // Configuration de chiffrement
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
  }

  // Génération de sel cryptographique robuste
  async generateSalt(length = 32) {
    return crypto.randomBytes(length);
  }

  // Dérivation de clé sécurisée
  async deriveKey(password, salt, iterations = 100000) {
    return new Promise((resolve, reject) => {
      scrypt.scrypt(
        Buffer.from(password),
        salt,
        iterations,
        this.keyLength,
        1,
        (error, progress, key) => {
          if (error) reject(error);
          if (key) resolve(Buffer.from(key));
        }
      );
    });
  }

  // Chiffrement de données sensibles
  async encrypt(data, key = null) {
    try {
      // Utilisation d'une clé de coffre-fort si non fournie
      if (!key) {
        const keyResponse = await this.vault.read('secret/encryption-key');
        key = Buffer.from(keyResponse.data.key, 'hex');
      }

      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        data: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      throw new Error('Échec du chiffrement');
    }
  }

  // Déchiffrement de données sensibles
  async decrypt(encryptedData, key = null) {
    try {
      // Utilisation d'une clé de coffre-fort si non fournie
      if (!key) {
        const keyResponse = await this.vault.read('secret/encryption-key');
        key = Buffer.from(keyResponse.data.key, 'hex');
      }

      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      throw new Error('Échec du déchiffrement');
    }
  }

  // Hachage de mot de passe avec Argon2
  async hashPassword(password) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });
  }

  // Vérification de mot de passe
  async verifyPassword(hashedPassword, password) {
    return argon2.verify(hashedPassword, password);
  }

  // Génération de token JWT sécurisé
  async generateSecureToken(payload, expiresIn = '1h') {
    const token = await this.vault.write('secret/jwt-tokens', {
      data: {
        payload: JSON.stringify(payload),
        createdAt: Date.now(),
        expiresAt: Date.now() + this.parseExpirationTime(expiresIn)
      }
    });

    return token.data.id;
  }

  // Validation de token JWT
  async validateSecureToken(tokenId) {
    const tokenData = await this.vault.read(`secret/jwt-tokens/${tokenId}`);

    if (!tokenData || tokenData.data.expiresAt < Date.now()) {
      throw new Error('Token invalide ou expiré');
    }

    return JSON.parse(tokenData.data.payload);
  }

  // Rotation de clés de chiffrement
  async rotateEncryptionKey() {
    const newKey = crypto.randomBytes(this.keyLength);

    await this.vault.write('secret/encryption-key', {
      data: {
        key: newKey.toString('hex'),
        rotatedAt: Date.now()
      }
    });

    return newKey;
  }

  // Utilitaire pour parser les durées d'expiration
  parseExpirationTime(expiresIn) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Format de durée invalide');

    return parseInt(match[1]) * units[match[2]];
  }

  // Génération de clé de chiffrement côté client
  async generateClientEncryptionKey() {
    return crypto.randomBytes(this.keyLength).toString('base64');
  }
}

export default new CryptographyService();
