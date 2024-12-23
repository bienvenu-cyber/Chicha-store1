const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs').promises;
const path = require('path');

const productData = [
    {
        name: "Chicha Premium Alpha",
        description: "Chicha haut de gamme avec design élégant et performance exceptionnelle",
        price: 129.99,
        category: "chicha",
        images: [
            {
                url: "/uploads/products/chicha-alpha-1.webp",
                alt: "Chicha Premium Alpha - Vue principale",
                isPrimary: true
            },
            {
                url: "/uploads/products/chicha-alpha-2.webp",
                alt: "Chicha Premium Alpha - Vue détaillée",
                isPrimary: false
            }
        ],
        stock: 15,
        featured: true,
        specifications: {
            height: 65,
            material: "Acier inoxydable et verre",
            color: "Noir et or"
        }
    },
    {
        name: "Pack Débutant Chicha",
        description: "Kit complet idéal pour les nouveaux amateurs de chicha",
        price: 79.99,
        category: "accessoire",
        images: [
            {
                url: "/uploads/products/pack-debutant-1.webp",
                alt: "Pack Débutant Chicha - Contenu complet",
                isPrimary: true
            }
        ],
        stock: 30,
        featured: false,
        specifications: {
            material: "Divers",
            color: "Multicolore"
        }
    },
    {
        name: "Tabac Premium Exotic Blend",
        description: "Mélange de tabac premium aux saveurs exotiques",
        price: 19.99,
        category: "tabac",
        images: [
            {
                url: "/uploads/products/tabac-exotic-1.webp",
                alt: "Tabac Premium Exotic Blend - Paquet",
                isPrimary: true
            }
        ],
        stock: 50,
        featured: true,
        specifications: {
            weight: 250,
            flavor: "Mélange tropical"
        }
    }
];

async function seedProducts() {
    try {
        // Connexion à la base de données
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Supprimer les produits existants
        await Product.deleteMany({});

        // Insérer les nouveaux produits
        const insertedProducts = await Product.insertMany(productData);
        
        console.log(`🌱 ${insertedProducts.length} produits ont été ajoutés avec succès !`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des produits :', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Exécuter le script
seedProducts();
