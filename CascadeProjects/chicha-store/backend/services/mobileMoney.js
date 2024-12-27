const axios = import('axios');
const { Order } = import('../models/Order');

class MobileMoneyService {
  constructor() {
    // Configurations pour les opérateurs mobile money d'Afrique de l'Ouest
    this.providers = {
      // Opérateurs existants
      mpesa: {
        apiUrl: process.env.MPESA_API_URL,
        apiKey: process.env.MPESA_API_KEY,
        shortCode: process.env.MPESA_SHORTCODE
      },
      orangeMoney: {
        apiUrl: process.env.ORANGE_MONEY_API_URL,
        apiKey: process.env.ORANGE_MONEY_API_KEY,
        merchantId: process.env.ORANGE_MONEY_MERCHANT_ID
      },
      mtnMobileMoney: {
        apiUrl: process.env.MTN_MOBILE_MONEY_API_URL,
        apiKey: process.env.MTN_MOBILE_MONEY_API_KEY,
        merchantCode: process.env.MTN_MOBILE_MONEY_MERCHANT_CODE
      },
      
      // Nouveaux opérateurs Afrique de l'Ouest
      moovMoney: {
        apiUrl: process.env.MOOV_MONEY_API_URL,
        apiKey: process.env.MOOV_MONEY_API_KEY,
        merchantId: process.env.MOOV_MONEY_MERCHANT_ID
      },
      celtisCash: {
        apiUrl: process.env.CELTIS_CASH_API_URL,
        apiKey: process.env.CELTIS_CASH_API_KEY,
        merchantCode: process.env.CELTIS_CASH_MERCHANT_CODE
      },
      wave: {
        apiUrl: process.env.WAVE_API_URL,
        apiKey: process.env.WAVE_API_KEY,
        merchantId: process.env.WAVE_MERCHANT_ID
      },
      expresso: {
        apiUrl: process.env.EXPRESSO_MONEY_API_URL,
        apiKey: process.env.EXPRESSO_MONEY_API_KEY,
        merchantCode: process.env.EXPRESSO_MONEY_MERCHANT_CODE
      },
      wizall: {
        apiUrl: process.env.WIZALL_API_URL,
        apiKey: process.env.WIZALL_API_KEY,
        merchantId: process.env.WIZALL_MERCHANT_ID
      },
      joni: {
        apiUrl: process.env.JONI_MONEY_API_URL,
        apiKey: process.env.JONI_MONEY_API_KEY,
        merchantCode: process.env.JONI_MONEY_MERCHANT_CODE
      },
      emoney: {
        apiUrl: process.env.EMONEY_API_URL,
        apiKey: process.env.EMONEY_API_KEY,
        merchantId: process.env.EMONEY_MERCHANT_ID
      }
    };
  }

  // Méthode générique d'initiation de paiement
  async initiatePayment(order, phoneNumber, provider) {
    try {
      // Vérifier si le provider existe
      if (!this.providers[provider]) {
        throw new Error(`Opérateur mobile money non supporté : ${provider}`);
      }

      // Dispatch vers la méthode spécifique
      const paymentMethod = `initiate${provider.charAt(0).toUpperCase() + provider.slice(1)}Payment`;
      
      if (typeof this[paymentMethod] !== 'function') {
        throw new Error(`Méthode de paiement non implémentée pour ${provider}`);
      }

      return await this[paymentMethod](order, phoneNumber);
    } catch (error) {
      console.error('Erreur d\'initiation de paiement mobile', error);
      throw error;
    }
  }

  // Méthode générique de vérification de statut
  async checkPaymentStatus(order, provider) {
    try {
      const transaction = order.mobileMoneyTransaction;
      
      if (!transaction || transaction.provider !== provider) {
        throw new Error('Transaction mobile money non trouvée');
      }

      // Dispatch vers la méthode de vérification spécifique
      const statusMethod = `check${provider.charAt(0).toUpperCase() + provider.slice(1)}Status`;
      
      if (typeof this[statusMethod] !== 'function') {
        throw new Error(`Méthode de vérification non implémentée pour ${provider}`);
      }

      const statusResponse = await this[statusMethod](transaction.transactionId);

      // Mettre à jour le statut de la commande
      if (statusResponse.status === 'success') {
        order.status = 'paid';
        order.mobileMoneyTransaction.status = 'completed';
        await order.save();
      }

      return statusResponse;
    } catch (error) {
      console.error('Erreur de vérification de statut', error);
      throw error;
    }
  }

  // Méthodes spécifiques pour chaque opérateur
  async initiateMoovMoneyPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.moovMoney.apiUrl + '/collect', 
        {
          merchantId: this.providers.moovMoney.merchantId,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          orderId: order._id.toString(),
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/moov-money/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.moovMoney.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mettre à jour la commande
      order.mobileMoneyTransaction = {
        provider: 'moovMoney',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Moov Money', error);
      throw error;
    }
  }

  async initiateCeltisCashPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.celtisCash.apiUrl + '/payment', 
        {
          merchantCode: this.providers.celtisCash.merchantCode,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          externalId: order._id.toString(),
          paymentNote: `Paiement commande ${order._id}`,
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/celtis-cash/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.celtisCash.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mettre à jour la commande
      order.mobileMoneyTransaction = {
        provider: 'celtisCash',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Celtis Cash', error);
      throw error;
    }
  }

  async initiateWavePayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.wave.apiUrl + '/collect', 
        {
          merchantId: this.providers.wave.merchantId,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          orderId: order._id.toString(),
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/wave/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.wave.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      order.mobileMoneyTransaction = {
        provider: 'wave',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Wave', error);
      throw error;
    }
  }

  async initiateExpressoPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.expresso.apiUrl + '/payment', 
        {
          merchantCode: this.providers.expresso.merchantCode,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          externalId: order._id.toString(),
          paymentNote: `Paiement commande ${order._id}`,
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/expresso/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.expresso.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      order.mobileMoneyTransaction = {
        provider: 'expresso',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Expresso', error);
      throw error;
    }
  }

  async initiateWizallPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.wizall.apiUrl + '/collect', 
        {
          merchantId: this.providers.wizall.merchantId,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          orderId: order._id.toString(),
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/wizall/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.wizall.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      order.mobileMoneyTransaction = {
        provider: 'wizall',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Wizall', error);
      throw error;
    }
  }

  async initiateJoniPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.joni.apiUrl + '/payment', 
        {
          merchantCode: this.providers.joni.merchantCode,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          externalId: order._id.toString(),
          paymentNote: `Paiement commande ${order._id}`,
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/joni/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.joni.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      order.mobileMoneyTransaction = {
        provider: 'joni',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement Joni', error);
      throw error;
    }
  }

  async initiateEmoneyPayment(order, phoneNumber) {
    try {
      const response = await axios.post(
        this.providers.emoney.apiUrl + '/collect', 
        {
          merchantId: this.providers.emoney.merchantId,
          amount: order.totalAmount,
          currency: 'XOF', // Franc CFA
          phoneNumber: phoneNumber,
          orderId: order._id.toString(),
          callbackUrl: `${process.env.BACKEND_URL}/api/payments/emoney/callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.emoney.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      order.mobileMoneyTransaction = {
        provider: 'emoney',
        transactionId: response.data.transactionId,
        status: 'pending'
      };
      await order.save();

      return {
        transactionId: response.data.transactionId,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Erreur de paiement E-Money', error);
      throw error;
    }
  }

  // Méthodes de vérification de statut
  async checkMoovMoneyStatus(transactionId) {
    const response = await axios.get(
      this.providers.moovMoney.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.moovMoney.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkCeltisCashStatus(transactionId) {
    const response = await axios.get(
      this.providers.celtisCash.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.celtisCash.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkWaveStatus(transactionId) {
    const response = await axios.get(
      this.providers.wave.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.wave.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkExpressoStatus(transactionId) {
    const response = await axios.get(
      this.providers.expresso.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.expresso.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkWizallStatus(transactionId) {
    const response = await axios.get(
      this.providers.wizall.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.wizall.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkJoniStatus(transactionId) {
    const response = await axios.get(
      this.providers.joni.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.joni.apiKey}`
        }
      }
    );
    return response.data;
  }

  async checkEmoneyStatus(transactionId) {
    const response = await axios.get(
      this.providers.emoney.apiUrl + `/transaction/${transactionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.emoney.apiKey}`
        }
      }
    );
    return response.data;
  }

  // Liste complète des opérateurs supportés
  getSupportedProviders() {
    return Object.keys(this.providers);
  }
}

export default = new MobileMoneyService();
