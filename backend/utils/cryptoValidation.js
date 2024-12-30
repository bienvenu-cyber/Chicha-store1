import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Liste des cryptomonnaies supportées
const SUPPORTED_CRYPTOCURRENCIES = ['btc', 'eth', 'usdt', 'bnb'];

// Validation des cryptomonnaies
export const validateCryptocurrency = (cryptocurrency) => {
    const normalizedCrypto = cryptocurrency.toLowerCase();
    if (!SUPPORTED_CRYPTOCURRENCIES.includes(normalizedCrypto)) {
        throw new Error(`Cryptomonnaie non supportée : ${cryptocurrency}`);
    }
    return normalizedCrypto;
};

// Récupération du taux de change
export const fetchCryptoRate = async (cryptocurrency) => {
    try {
        const normalizedCrypto = validateCryptocurrency(cryptocurrency);
        const apiEndpoint = process.env.COINGECKO_API_ENDPOINT || 'https://api.coingecko.com/api/v3/simple/price';
        
        const response = await axios.get(apiEndpoint, {
            params: {
                ids: normalizedCrypto === 'btc' ? 'bitcoin' : 
                      normalizedCrypto === 'eth' ? 'ethereum' : 
                      normalizedCrypto === 'usdt' ? 'tether' : 
                      normalizedCrypto === 'bnb' ? 'binancecoin' : 
                      normalizedCrypto,
                vs_currencies: 'usd'
            }
        });

        const cryptoData = response.data;
        const cryptoId = normalizedCrypto === 'btc' ? 'bitcoin' : 
                         normalizedCrypto === 'eth' ? 'ethereum' : 
                         normalizedCrypto === 'usdt' ? 'tether' : 
                         normalizedCrypto === 'bnb' ? 'binancecoin' : 
                         normalizedCrypto;

        const rate = cryptoData[cryptoId]?.usd;
        
        if (!rate || isNaN(rate)) {
            throw new Error('Taux de change invalide');
        }

        return rate;
    } catch (error) {
        console.error(`Erreur lors de la récupération du taux de change pour ${cryptocurrency}:`, error.message);
        throw new Error('Impossible de récupérer le taux de change');
    }
};

// Conversion crypto en USD
export const convertCryptoToUSD = async (cryptocurrency, amount) => {
    try {
        const rate = await fetchCryptoRate(cryptocurrency);
        return amount * rate;
    } catch (error) {
        console.error(`Erreur de conversion ${cryptocurrency} en USD:`, error.message);
        throw error;
    }
};

// Validation du montant de transaction
export const validateTransactionAmount = (amount, cryptocurrency) => {
    if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('Montant de transaction invalide');
    }

    const minAmounts = {
        'btc': 0.0001,
        'eth': 0.01,
        'usdt': 1,
        'bnb': 0.01
    };

    const normalizedCrypto = validateCryptocurrency(cryptocurrency);
    const minAmount = minAmounts[normalizedCrypto];

    if (amount < minAmount) {
        throw new Error(`Montant minimum pour ${cryptocurrency} non respecté`);
    }

    return true;
};

// Vérification de l'expiration du paiement
export const isPaymentExpired = (createdAt, expirationHours = 2) => {
    const createdTime = new Date(createdAt);
    const currentTime = new Date();
    const expirationTime = new Date(createdTime.getTime() + expirationHours * 60 * 60 * 1000);
    
    return currentTime > expirationTime;
};

// Génération de signature de webhook
export const generateWebhookSignature = (payload, secret) => {
    if (!secret) {
        console.error('Clé secrète de webhook non configurée');
        return null;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
};

// Validation de signature de webhook
export const validateWebhookSignature = (payload, signature, secret) => {
    if (!secret) {
        console.error('Clé secrète de webhook non configurée');
        return false;
    }

    const expectedSignature = generateWebhookSignature(payload, secret);
    return expectedSignature === signature;
};

export default {
    validateCryptocurrency,
    fetchCryptoRate,
    convertCryptoToUSD,
    validateTransactionAmount,
    isPaymentExpired,
    generateWebhookSignature,
    validateWebhookSignature
};
