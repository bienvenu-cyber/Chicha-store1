const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: [
      'SuperAdmin', 
      'AdminProduit', 
      'AdminMarketing', 
      'AdminFinance', 
      'AdminSupport'
    ],
    default: 'AdminProduit'
  },
  permissions: {
    produits: { type: Boolean, default: false },
    utilisateurs: { type: Boolean, default: false },
    commandes: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    finance: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware de hachage du mot de passe
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode de vérification du mot de passe
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode de verrouillage du compte
adminSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return this;
  }

  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 3600000); // 1 heure
  }

  return this.save();
};

// Méthode de réinitialisation des tentatives de connexion
adminSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  return this.save();
};

// Index pour optimisation
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);
