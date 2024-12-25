import User from '../models/User.js.js';
import Product from '../models/Product.js.js';

export default class PersonalizationService {
    // Profil de préférences utilisateur
    async createUserPreferenceProfile(userId) {
        try {
            const user = await User.findById(userId).populate('orderHistory.products');
            
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Analyse des préférences
            const preferenceProfile = {
                favoriteCategories: this.analyzeFavoriteCategories(user.orderHistory),
                averageSpending: this.calculateAverageSpending(user.orderHistory),
                preferredBrands: this.identifyPreferredBrands(user.orderHistory),
                smokingFrequency: this.determineSmokeFrequency(user.orderHistory)
            };

            // Mise à jour du profil utilisateur
            user.preferenceProfile = preferenceProfile;
            await user.save();

            return preferenceProfile;
        } catch (error) {
            console.error('Erreur de création de profil de préférences:', error);
            throw error;
        }
    }

    // Analyse des catégories préférées
    analyzeFavoriteCategories(orderHistory) {
        const categoryCount = {};
        
        orderHistory.forEach(order => {
            order.products.forEach(product => {
                categoryCount[product.category] = 
                    (categoryCount[product.category] || 0) + 1;
            });
        });

        return Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
    }

    // Calcul des dépenses moyennes
    calculateAverageSpending(orderHistory) {
        if (orderHistory.length === 0) return 0;

        const totalSpending = orderHistory.reduce(
            (sum, order) => sum + order.totalAmount, 
            0
        );

        return totalSpending / orderHistory.length;
    }

    // Identification des marques préférées
    identifyPreferredBrands(orderHistory) {
        const brandCount = {};
        
        orderHistory.forEach(order => {
            order.products.forEach(product => {
                const brand = product.brand || 'Non spécifié';
                brandCount[brand] = (brandCount[brand] || 0) + 1;
            });
        });

        return Object.entries(brandCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
    }

    // Détermination de la fréquence de consommation
    determineSmokeFrequency(orderHistory) {
        const totalOrders = orderHistory.length;
        const timeBetweenOrders = this.calculateTimeBetweenOrders(orderHistory);

        if (totalOrders < 2) return 'Occasionnel';
        if (timeBetweenOrders <= 30) return 'Fréquent';
        if (timeBetweenOrders <= 90) return 'Régulier';
        return 'Occasionnel';
    }

    // Calcul du temps entre les commandes
    calculateTimeBetweenOrders(orderHistory) {
        if (orderHistory.length < 2) return Infinity;

        const sortedOrders = orderHistory
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const firstOrder = sortedOrders[0];
        const lastOrder = sortedOrders[sortedOrders.length - 1];

        return (new Date(lastOrder.createdAt) - new Date(firstOrder.createdAt)) 
            / (1000 * 60 * 60 * 24);  // Convertir en jours
    }

    // Génération de recommandations personnalisées
    async generatePersonalizedRecommendations(userId) {
        try {
            const user = await User.findById(userId);
            const preferenceProfile = user.preferenceProfile || 
                await this.createUserPreferenceProfile(userId);

            // Requête de produits basée sur le profil
            const recommendations = await Product.find({
                category: { $in: preferenceProfile.favoriteCategories },
                price: { 
                    $gte: preferenceProfile.averageSpending * 0.8,
                    $lte: preferenceProfile.averageSpending * 1.2 
                }
            }).limit(6);

            return recommendations;
        } catch (error) {
            console.error('Erreur de recommandations personnalisées:', error);
            throw error;
        }
    }
}

export default new PersonalizationService();
