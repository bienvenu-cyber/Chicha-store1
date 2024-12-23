const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

class TokenManager {
  constructor() {
    // Configuration Redis pour le stockage sécurisé des tokens
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
  }

  // Génération de token sécurisé
  generateAccessToken(user) {
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0
    };

    const accessToken = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );

    // Stockage du token dans Redis avec expiration
    this.storeTokenInRedis(user._id, accessToken);

    return accessToken;
  }

  // Génération de refresh token
  generateRefreshToken(user) {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Stocker le refresh token de manière sécurisée
    this.storeRefreshTokenInRedis(user._id, refreshToken);

    return refreshToken;
  }

  // Stockage sécurisé des tokens
  async storeTokenInRedis(userId, token) {
    await this.redis.set(
      `access_token:${userId}`, 
      token, 
      'EX', 
      3600 // 1 heure
    );
  }

  async storeRefreshTokenInRedis(userId, refreshToken) {
    await this.redis.set(
      `refresh_token:${userId}`, 
      refreshToken, 
      'EX', 
      30 * 24 * 3600 // 30 jours
    );
  }

  // Validation du token
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérification supplémentaire via Redis
      const storedToken = await this.redis.get(`access_token:${decoded._id}`);
      
      if (storedToken !== token) {
        throw new Error('Token invalide');
      }

      return decoded;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  // Rotation des tokens
  async rotateTokens(user) {
    // Incrémenter la version du token
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  // Révocation des tokens
  async revokeTokens(userId) {
    await Promise.all([
      this.redis.del(`access_token:${userId}`),
      this.redis.del(`refresh_token:${userId}`)
    ]);
  }

  // Protection contre les attaques par force brute
  async trackLoginAttempts(email) {
    const key = `login_attempts:${email}`;
    const attempts = await this.redis.incr(key);
    
    // Limiter à 5 tentatives
    if (attempts > 5) {
      // Bloquer les tentatives pendant 15 minutes
      await this.redis.expire(key, 15 * 60);
      throw new Error('Trop de tentatives. Compte temporairement bloqué.');
    }

    // Réinitialiser après une connexion réussie
    if (attempts === 1) {
      await this.redis.expire(key, 15 * 60);
    }
  }
}

module.exports = new TokenManager();
