import { 
    validateCryptocurrency, 
    fetchCryptoRate, 
    convertCryptoToUSD, 
    validateTransactionAmount, 
    isPaymentExpired, 
    generateWebhookSignature, 
    validateWebhookSignature 
} from '../utils/cryptoValidation.js';
import axios from 'axios';

// Mock axios pour éviter les appels réseau réels
jest.mock('axios');

describe('Crypto Validation Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateCryptocurrency', () => {
        test('devrait valider une cryptomonnaie supportée', () => {
            expect(validateCryptocurrency('btc')).toBe('btc');
            expect(validateCryptocurrency('ETH')).toBe('eth');
        });

        test('devrait lever une erreur pour une cryptomonnaie non supportée', () => {
            expect(() => validateCryptocurrency('XRP')).toThrow('Cryptomonnaie non supportée');
        });
    });

    describe('fetchCryptoRate', () => {
        test('devrait récupérer le taux de change correctement', async () => {
            const mockResponse = {
                data: {
                    bitcoin: { usd: 50000 }
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            const rate = await fetchCryptoRate('btc');
            expect(rate).toBe(50000);
        });

        test('devrait lever une erreur si le taux est invalide', async () => {
            const mockResponse = {
                data: {
                    bitcoin: { usd: null }
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            await expect(fetchCryptoRate('btc')).rejects.toThrow('Taux de change invalide');
        });
    });

    describe('convertCryptoToUSD', () => {
        test('devrait convertir correctement le montant', async () => {
            const mockRate = 50000;
            jest.spyOn(global.console, 'error').mockImplementation(() => {});
            
            axios.get.mockResolvedValue({
                data: {
                    bitcoin: { usd: mockRate }
                }
            });

            const usdValue = await convertCryptoToUSD('btc', 2);
            expect(usdValue).toBe(100000);
        });
    });

    describe('validateTransactionAmount', () => {
        test('devrait valider un montant de transaction correct', () => {
            expect(validateTransactionAmount(0.001, 'btc')).toBe(true);
            expect(validateTransactionAmount(10, 'usdt')).toBe(true);
        });

        test('devrait lever une erreur pour un montant invalide', () => {
            expect(() => validateTransactionAmount(-1, 'btc')).toThrow('Montant de transaction invalide');
            expect(() => validateTransactionAmount(0.00001, 'btc')).toThrow('Montant minimum');
        });
    });

    describe('isPaymentExpired', () => {
        test('devrait déterminer correctement l\'expiration du paiement', () => {
            const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 heures dans le passé
            const futureDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 heure dans le futur

            expect(isPaymentExpired(pastDate, 2)).toBe(true);
            expect(isPaymentExpired(futureDate, 2)).toBe(false);
        });
    });

    describe('Webhook Signature', () => {
        const testPayload = { id: 'test123' };
        const testSecret = 'test_secret';

        test('generateWebhookSignature devrait créer une signature', () => {
            const signature = generateWebhookSignature(testPayload, testSecret);
            expect(signature).toBeTruthy();
            expect(typeof signature).toBe('string');
        });

        test('validateWebhookSignature devrait valider une signature correcte', () => {
            const signature = generateWebhookSignature(testPayload, testSecret);
            const isValid = validateWebhookSignature(testPayload, signature, testSecret);
            expect(isValid).toBe(true);
        });

        test('validateWebhookSignature devrait rejeter une signature incorrecte', () => {
            const isValid = validateWebhookSignature(testPayload, 'wrong_signature', testSecret);
            expect(isValid).toBe(false);
        });

        test('generateWebhookSignature devrait gérer l\'absence de clé secrète', () => {
            const signature = generateWebhookSignature(testPayload, null);
            expect(signature).toBeNull();
        });
    });
});
