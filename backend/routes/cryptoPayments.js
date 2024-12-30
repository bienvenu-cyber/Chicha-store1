import express from 'express';
const router = express.Router();
import CryptoPayment from '../models/CryptoPayment.js.js';
import Order from '../models/Order.js.js';
import { auth } from '../middleware/auth.js.js';
import { 
    validateCryptoCurrency, 
    fetchCryptoRate, 
    validateWebhookSignature, 
    validateTransactionAmount,
    isPaymentExpired
} from '../utils/cryptoValidation.js';
import axios from 'axios'; 
import crypto from 'crypto'; 

// Service amélioré pour obtenir les taux de change
const getCryptoRate = async (crypto) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
        const rate = response.data[crypto.toLowerCase()].usd;
        
        if (!rate || rate <= 0) {
            throw new Error('Taux de change invalide');
        }
        
        return rate;
    } catch (error) {
        console.error(`Erreur lors de la récupération du taux de change pour ${crypto}:`, error);
        throw new Error('Impossible de récupérer le taux de change');
    }
};

// Générer une adresse de portefeuille sécurisée
const generateSecureWalletAddress = (cryptocurrency) => {
    return crypto.createHash('sha256')
        .update(`${cryptocurrency}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`)
        .digest('hex');
};

// Initialiser un paiement crypto avec plus de validations
router.post('/initiate', auth, async (req, res) => {
    try {
        const { orderId, cryptocurrency } = req.body;
        
        // Validation des paramètres
        if (!orderId) {
            return res.status(400).send({ error: 'ID de commande requis' });
        }
        
        if (!validateCryptoCurrency(cryptocurrency)) {
            return res.status(400).send({ error: 'Cryptocurrency non supportée' });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            paymentStatus: 'pending'
        }).lean();

        if (!order) {
            return res.status(404).send({ 
                error: 'Commande non trouvée', 
                details: 'Vérifiez que la commande existe et vous appartient' 
            });
        }

        // Obtenir le taux de change actuel
        const rate = await fetchCryptoRate(cryptocurrency);
        const amountCrypto = Number((order.totalAmount / rate).toFixed(8)); // Arrondi précis

        // Générer une adresse de portefeuille unique et sécurisée
        const walletAddress = generateSecureWalletAddress(cryptocurrency);

        const payment = new CryptoPayment({
            order: order._id,
            cryptocurrency,
            walletAddress,
            amountCrypto,
            amountFiat: order.totalAmount,
            exchangeRate: rate,
            status: 'pending',
            createdAt: new Date()
        });

        await payment.save();

        res.status(201).json({
            payment,
            instructions: {
                amount: amountCrypto,
                currency: cryptocurrency,
                address: walletAddress,
                message: `Envoyez exactement ${amountCrypto} ${cryptocurrency} à l'adresse suivante`,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expiration après 24h
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initiation du paiement:', error);
        res.status(400).send({ 
            error: 'Échec de l\'initiation du paiement', 
            details: error.message 
        });
    }
});

// Webhook avec signature et validation améliorées
router.post('/webhook', 
    express.raw({type: 'application/json'}),
    async (req, res) => {
        try {
            // Validation de la signature du webhook
            if (!validateWebhookSignature(req.body, req.headers['x-webhook-signature'])) {
                return res.status(403).send({ error: 'Signature de webhook invalide' });
            }

            const { transactionHash, address, amount, confirmations } = req.body;

            // Validation des paramètres
            if (!transactionHash || !address || !amount) {
                return res.status(400).send({ error: 'Paramètres de webhook incomplets' });
            }

            const payment = await CryptoPayment.findOne({ walletAddress: address });
            if (!payment) {
                return res.status(404).send({ error: 'Paiement non trouvé' });
            }

            // Vérifier l'expiration du paiement
            if (isPaymentExpired(payment.createdAt)) {
                return res.status(400).send({ error: 'Paiement expiré' });
            }

            // Vérification du montant
            if (!validateTransactionAmount(payment.amountCrypto, amount)) {
                console.warn(`Montant de transaction suspect: attendu ${payment.amountCrypto}, reçu ${amount}`);
                return res.status(400).send({ error: 'Montant de transaction incorrect' });
            }

            payment.transactionHash = transactionHash;
            payment.confirmations = confirmations;

            if (confirmations >= 3) { // Nombre de confirmations requis
                payment.status = 'completed';
                
                // Mettre à jour le statut de la commande
                await Order.findByIdAndUpdate(payment.order, {
                    paymentStatus: 'completed',
                    status: 'processing'
                });
            } else {
                payment.status = 'confirming';
            }

            await payment.save();
            res.json({ received: true, status: payment.status });
        } catch (error) {
            console.error('Erreur dans le webhook de paiement:', error);
            res.status(500).send({ 
                error: 'Erreur de traitement du webhook', 
                details: error.message 
            });
        }
    }
);

// Vérifier le statut d'un paiement avec plus de détails
router.get('/status/:walletAddress', auth, async (req, res) => {
    try {
        const payment = await CryptoPayment.findOne({
            walletAddress: req.params.walletAddress
        }).populate('order');
        
        if (!payment) {
            return res.status(404).send({ 
                error: 'Paiement non trouvé', 
                details: 'Vérifiez l\'adresse du portefeuille' 
            });
        }

        // Vérifier l'expiration du paiement
        const expired = isPaymentExpired(payment.createdAt);

        res.json({
            ...payment.toObject(),
            expired,
            estimatedCompletionTime: !expired 
                ? new Date(payment.createdAt.getTime() + 24 * 60 * 60 * 1000)
                : null
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du statut de paiement:', error);
        res.status(500).send({ 
            error: 'Impossible de récupérer le statut du paiement', 
            details: error.message 
        });
    }
});

export default router;
