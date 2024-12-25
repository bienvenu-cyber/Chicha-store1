import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  frequency: {
    type: String,
    enum: ['Mensuel', 'Trimestriel', 'Semestriel'],
    required: true
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Actif', 'Suspendu', 'Annulé'],
    default: 'Actif'
  },
  paymentMethod: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Middleware pour mettre à jour la prochaine date de livraison
subscriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('frequency')) {
    const now = new Date();
    switch(this.frequency) {
      case 'Mensuel':
        this.nextDeliveryDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'Trimestriel':
        this.nextDeliveryDate = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'Semestriel':
        this.nextDeliveryDate = new Date(now.setMonth(now.getMonth() + 6));
        break;
    }
  }
  next();
});

// Index pour optimiser les requêtes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
