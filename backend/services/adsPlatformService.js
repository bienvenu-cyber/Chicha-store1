const { google } = require('googleapis');
const FacebookAds = require('facebook-ads-sdk');
const ErrorHandler = require('../utils/errorHandler');
const PrivacyManager = require('../utils/privacyManager');
const APIPerformance = require('../utils/apiPerformance');

class AdsPlatformService {
  constructor() {
    // Configuration Google Ads
    this.googleAdsClient = new google.ads.v14.GoogleAdsClient({
      credentials: {
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
      }
    });

    // Configuration Facebook Ads
    this.facebookAds = new FacebookAds.FacebookAds({
      accessToken: process.env.FACEBOOK_ADS_ACCESS_TOKEN,
      accountId: process.env.FACEBOOK_ADS_ACCOUNT_ID
    });
  }

  async createRemarketingAudience(userData) {
    // Anonymisation des données
    const anonymizedData = PrivacyManager.anonymizeData(userData);

    // Vérification du consentement
    if (!PrivacyManager.checkConsent(userData.consentRecord, 'marketing')) {
      throw new Error('Consentement marketing non accordé');
    }

    try {
      return await APIPerformance.measureAPIPerformance(async () => {
        const [googleAudience, facebookAudience] = await Promise.all([
          this.createGoogleRemarketingAudience(anonymizedData),
          this.createFacebookRemarketingAudience(anonymizedData)
        ]);

        return { google: googleAudience, facebook: facebookAudience };
      }, { 
        service: 'AdsPlatform', 
        method: 'createRemarketingAudience' 
      });
    } catch (error) {
      ErrorHandler.handleAdsSyncError(error, {
        service: this,
        method: 'createRemarketingAudience',
        args: [userData]
      });
      throw error;
    }
  }

  async createGoogleRemarketingAudience(anonymizedData) {
    const audienceService = this.googleAdsClient.getService('AudienceService');

    const customAudience = {
      name: `Remarketing - ${PrivacyManager.hashPersonalData(anonymizedData.id)}`,
      description: 'Audience de remarketing personnalisée',
      membershipLifeSpan: 540,
      type: 'USER_LIST',
      userList: {
        membershipStatus: 'OPEN',
        matchRateType: 'SIMILAR'
      }
    };

    const operation = { create: customAudience };
    const response = await audienceService.mutate({ operations: [operation] });
    
    return response.results[0];
  }

  async createFacebookRemarketingAudience(anonymizedData) {
    const customAudience = await this.facebookAds.createCustomAudience({
      name: `Remarketing - ${PrivacyManager.hashPersonalData(anonymizedData.id)}`,
      description: 'Audience de remarketing personnalisée',
      subtype: 'CUSTOM',
      rule: {
        inclusions: {
          operator: 'OR',
          rules: anonymizedData.segments.map(segment => ({
            type: 'segment',
            value: segment
          }))
        }
      }
    });

    return customAudience;
  }

  async createRemarkentingCampaign(productData) {
    try {
      return await APIPerformance.cachedAPICall(
        `remarketing_campaign_${productData._id}`, 
        async () => {
          const [googleCampaign, facebookCampaign] = await Promise.all([
            this.createGoogleRemarkentingCampaign(productData),
            this.createFacebookRemarkentingCampaign(productData)
          ]);

          return { google: googleCampaign, facebook: facebookCampaign };
        },
        'remarketing'
      );
    } catch (error) {
      ErrorHandler.handleAdsSyncError(error, {
        service: this,
        method: 'createRemarkentingCampaign',
        args: [productData]
      });
      throw error;
    }
  }

  async createGoogleRemarkentingCampaign(productData) {
    const campaignService = this.googleAdsClient.getService('CampaignService');

    const campaign = {
      name: `Remarketing - ${productData.name}`,
      advertisingChannelType: 'DISPLAY',
      status: 'PAUSED',
      biddingStrategy: {
        type: 'TARGET_CPA',
        targetCpa: {
          targetCpaMicros: 1000000 // 1€
        }
      },
      remarketingSettings: {
        audienceId: productData.googleAudienceId
      }
    };

    const operation = {
      create: campaign
    };

    const response = await campaignService.mutate({ operations: [operation] });
    return response.results[0];
  }

  async createFacebookRemarkentingCampaign(productData) {
    const campaign = await this.facebookAds.createCampaign({
      name: `Remarketing - ${productData.name}`,
      objective: 'PRODUCT_CATALOG_SALES',
      status: 'PAUSED',
      specialAdCategories: ['NONE'],
      adSetSpecs: {
        targeting: {
          custom_audiences: [productData.facebookAudienceId]
        },
        optimization_goal: 'OFFSITE_CONVERSIONS',
        billing_event: 'IMPRESSIONS'
      }
    });

    return campaign;
  }

  async trackConversion(conversionData) {
    try {
      await Promise.all([
        this.trackGoogleConversion(conversionData),
        this.trackFacebookConversion(conversionData)
      ]);
    } catch (error) {
      ErrorHandler.handleAdsSyncError(error, {
        service: this,
        method: 'trackConversion',
        args: [conversionData]
      });
      throw error;
    }
  }

  async trackGoogleConversion(conversionData) {
    const conversionService = this.googleAdsClient.getService('ConversionActionService');

    const conversionAction = {
      name: `Conversion - ${conversionData.orderId}`,
      type: 'UPLOAD',
      category: 'PURCHASE',
      valueSettings: {
        defaultValue: conversionData.totalAmount,
        currency: 'EUR'
      }
    };

    const operation = {
      create: conversionAction
    };

    await conversionService.mutate({ operations: [operation] });
  }

  async trackFacebookConversion(conversionData) {
    await this.facebookAds.createConversion({
      event: 'Purchase',
      eventTime: new Date(),
      value: conversionData.totalAmount,
      currency: 'EUR',
      orderId: conversionData.orderId
    });
  }
}

module.exports = new AdsPlatformService();
