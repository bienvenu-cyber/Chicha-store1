import mongoose from 'mongoose';

const remarketingCampaignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  abandonedCartItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  campaignType: {
    type: String,
    enum: ['email', 'ads', 'push_notification'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'converted'],
    default: 'pending'
  },
  sentAt: Date,
  conversionValue: Number,
  conversionDate: Date,
  channel: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'email', 'sms']
  },
  trackingParameters: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, {
  timestamps: true
});

remarketingCampaignSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
};

remarketingCampaignSchema.methods.markAsConverted = function(conversionValue) {
  this.status = 'converted';
  this.conversionValue = conversionValue;
  this.conversionDate = new Date();
};

remarketingCampaignSchema.statics.createFromAbandonedCart = async function(userId, cartItems) {
  const campaign = new this({
    user: userId,
    abandonedCartItems: cartItems.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price
    })),
    campaignType: 'email',
    channel: 'email',
    trackingParameters: {
      utmSource: 'abandoned_cart',
      utmMedium: 'email',
      utmCampaign: `remarketing_${new Date().toISOString().split('T')[0]}`
    }
  });

  return await campaign.save();
};

export default mongoose.model('RemarketingCampaign', remarketingCampaignSchema);
