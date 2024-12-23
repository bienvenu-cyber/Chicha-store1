const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../services/logger');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Authentication rate limiter
const authLimiter = new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 60 * 15, // per 15 minutes
});

const auth = async (req, res, next) => {
    try {
        // Check for token
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            logger.warn('Authentication attempt without token');
            return res.status(401).send({ error: 'Aucun token fourni.' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Rate limit authentication attempts
        try {
            await authLimiter.consume(req.ip);
        } catch (rateLimiterRes) {
            logger.error(`Rate limit exceeded for IP: ${req.ip}`);
            return res.status(429).send({ 
                error: 'Trop de tentatives. Veuillez réessayer plus tard.' 
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'],
                maxAge: '7d'
            });
        } catch (jwtError) {
            logger.warn('Invalid token verification', { 
                error: jwtError.message, 
                ip: req.ip 
            });
            return res.status(401).send({ error: 'Token invalide.' });
        }

        // Find user
        const user = await User.findOne({ 
            _id: decoded.id, 
            'tokens.token': token 
        }).select('-password');

        if (!user) {
            logger.warn('User not found for token', { 
                userId: decoded.id, 
                ip: req.ip 
            });
            return res.status(401).send({ error: 'Utilisateur non authentifié.' });
        }

        // Check user account status
        if (user.accountLocked) {
            logger.error('Attempt to access locked account', { 
                userId: user._id, 
                ip: req.ip 
            });
            return res.status(403).send({ error: 'Compte verrouillé.' });
        }

        // Attach user and token to request
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication middleware error', { 
            error: error.message, 
            ip: req.ip 
        });
        res.status(500).send({ error: 'Erreur d\'authentification interne.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                logger.warn('Non-admin access attempt', { 
                    userId: req.user._id, 
                    role: req.user.role 
                });
                return res.status(403).send({ error: 'Accès administrateur requis.' });
            }
            next();
        });
    } catch (error) {
        logger.error('Admin authentication error', { error: error.message });
        res.status(500).send({ error: 'Erreur d\'authentification admin.' });
    }
};

module.exports = { auth, adminAuth };
