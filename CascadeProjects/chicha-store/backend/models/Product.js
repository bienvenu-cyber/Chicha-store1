const mongoose = import('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    promotionalPrice: {
        type: Number,
        min: 0,
        default: null
    },
    category: {
        type: String,
        required: true,
        enum: ['chicha', 'tabac', 'charbon', 'accessoire']
    },
    imageUrl: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    specifications: {
        height: Number,
        material: String,
        color: String
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    }]
}, {
    timestamps: true
});

// Ajouter un index pour la recherche
productSchema.index({ name: 'text', description: 'text' });

export default = mongoose.model('Product', productSchema);
