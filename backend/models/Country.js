const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 2,
    maxlength: 2
  },
  continent: {
    type: String,
    enum: [
      'Africa', 
      'Europe', 
      'Asia', 
      'North America', 
      'South America', 
      'Oceania', 
      'Antarctica'
    ]
  },
  currency: {
    code: {
      type: String,
      uppercase: true
    },
    name: String,
    symbol: String
  },
  supportedPaymentMethods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  }],
  regulatoryComplexity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  taxRegime: {
    standardVATRate: Number,
    digitalServicesTax: Number
  },
  languagesSupported: [String],
  phoneCodePrefix: String,
  timeZones: [String],
  isEUMember: Boolean,
  isOECDMember: Boolean
}, {
  timestamps: true,
  indexes: [
    { fields: { code: 1 } },
    { fields: { continent: 1 } }
  ]
});

// Méthode statique pour ajouter un pays
CountrySchema.statics.addCountry = async function(countryData) {
  const country = new this(countryData);
  return await country.save();
};

// Méthode pour obtenir les pays par continent
CountrySchema.statics.getCountriesByContinent = async function(continent) {
  return await this.find({ continent }).select('name code');
};

module.exports = mongoose.model('Country', CountrySchema);
