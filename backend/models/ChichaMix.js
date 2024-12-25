import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: {
    type: String, 
    enum: ['Tabac', 'Fruit', 'Épice'],
    required: true
  },
  intensity: { 
    type: Number, 
    min: 1, 
    max: 10,
    required: true 
  }
});

const chichaMixSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [ingredientSchema],
  totalIntensity: {
    type: Number,
    min: 0,
    max: 20
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
chichaMixSchema.index({ user: 1, createdAt: -1 });
chichaMixSchema.index({ isPublic: 1, likes: -1 });

export default mongoose.model('ChichaMix', chichaMixSchema);
