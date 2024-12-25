import mongoose from 'mongoose';
import { Country } from '../models/Country.js.js';
import { PaymentMethod } from '../models/PaymentMethod.js.js';

const initializePaymentData = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Pays africains
    const africanCountries = [
      {
        name: 'Côte d\'Ivoire',
        code: 'CI',
        continent: 'Africa',
        currency: {
          code: 'XOF',
          name: 'Franc CFA',
          symbol: 'CFA'
        },
        languagesSupported: ['French'],
        phoneCodePrefix: '+225',
        timeZones: ['UTC'],
        isEUMember: false,
        isOECDMember: false
      },
      // Ajouter plus de pays africains
      {
        name: 'Sénégal',
        code: 'SN',
        continent: 'Africa',
        currency: {
          code: 'XOF',
          name: 'Franc CFA',
          symbol: 'CFA'
        }
      }
    ];

    // Méthodes de paiement
    const paymentMethods = [
      {
        name: 'Orange Money',
        type: 'mobile_money',
        provider: 'Orange',
        supportedCurrencies: ['XOF', 'USD'],
        feeStructure: {
          percentageFee: 0.02,
          minimumFee: 100,
          maximumFee: 10000
        },
        processingTime: { min: 1, max: 24 },
        requiresVerification: true,
        isInternational: false
      },
      {
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        provider: 'MTN',
        supportedCurrencies: ['XOF', 'USD'],
        feeStructure: {
          percentageFee: 0.015,
          minimumFee: 50,
          maximumFee: 5000
        },
        processingTime: { min: 1, max: 24 },
        requiresVerification: true,
        isInternational: false
      }
      // Ajouter plus de méthodes de paiement
    ];

    // Insérer les pays
    const insertedCountries = await Country.insertMany(africanCountries);

    // Insérer les méthodes de paiement
    const insertedMethods = await PaymentMethod.insertMany(paymentMethods);

    // Associer les méthodes de paiement aux pays
    for (let country of insertedCountries) {
      country.supportedPaymentMethods = insertedMethods
        .filter(method => method.countriesSupported.includes(country._id))
        .map(method => method._id);
      await country.save();
    }

    console.log('Données de paiement initialisées avec succès');
  } catch (error) {
    console.error('Erreur d\'initialisation', error);
  } finally {
    await mongoose.connection.close();
  }
};

initializePaymentData();
