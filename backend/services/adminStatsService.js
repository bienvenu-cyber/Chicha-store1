import Admin from '../models/Admin.js.js';
import User from '../models/User.js.js';
import Order from '../models/Order.js.js';
import Product from '../models/Product.js.js';
import ChichaMix from '../models/ChichaMix.js.js';

export default class AdminStatsService {
  // Récupération des statistiques du tableau de bord
  async getDashboardStats(adminId) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin non trouvé');
      }

      const stats = {
        utilisateurs: await this.getUserStats(admin),
        commandes: await this.getOrderStats(admin),
        produits: await this.getProductStats(admin),
        revenus: await this.getRevenueStats(admin),
        communaute: await this.getCommunityStats(admin)
      };

      return stats;
    } catch (error) {
      throw new Error(`Erreur de récupération des statistiques : ${error.message}`);
    }
  }

  // Statistiques des utilisateurs
  async getUserStats(admin) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: await User.countDocuments(),
      nouveauxUtilisateurs: await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      }),
      utilisateursActifs: await User.countDocuments({
        lastLogin: { $gte: sevenDaysAgo }
      })
    };
  }

  // Statistiques des commandes
  async getOrderStats(admin) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: await Order.countDocuments(),
      nouvellesCommandes: await Order.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      }),
      commandesEnCours: await Order.countDocuments({
        status: 'En cours'
      }),
      montantTotal: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    };
  }

  // Statistiques des produits
  async getProductStats(admin) {
    return {
      total: await Product.countDocuments(),
      produitsActifs: await Product.countDocuments({ isActive: true }),
      produitsRupture: await Product.countDocuments({ stock: 0 }),
      categoriesPopulaires: await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    };
  }

  // Statistiques de revenus
  async getRevenueStats(admin) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: 'Terminée' 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalMensuel: await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: thirtyDaysAgo },
            status: 'Terminée' 
          } 
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      revenueParJour: revenueByDay
    };
  }

  // Statistiques de la communauté
  async getCommunityStats(admin) {
    return {
      totalMixes: await ChichaMix.countDocuments(),
      mixesPublics: await ChichaMix.countDocuments({ isPublic: true }),
      topMixes: await ChichaMix.find({ isPublic: true })
        .sort({ likes: -1 })
        .limit(5)
        .populate('user', 'username')
    };
  }

  // Mise à jour des permissions admin
  async updateAdminPermissions(updatingAdminId, targetAdminId, permissions) {
    try {
      const updatingAdmin = await Admin.findById(updatingAdminId);
      
      if (updatingAdmin.role !== 'SuperAdmin') {
        throw new Error('Seul un SuperAdmin peut modifier les permissions');
      }

      const targetAdmin = await Admin.findById(targetAdminId);

      if (!targetAdmin) {
        throw new Error('Admin cible non trouvé');
      }

      // Mise à jour des permissions
      targetAdmin.permissions = {
        ...targetAdmin.permissions,
        ...permissions
      };

      await targetAdmin.save();

      return this.sanitizeAdmin(targetAdmin);
    } catch (error) {
      throw new Error(`Erreur de mise à jour des permissions : ${error.message}`);
    }
  }

  // Nettoyage des données admin
  sanitizeAdmin(admin) {
    const sanitized = admin.toObject();
    delete sanitized.password;
    delete sanitized.twoFactorSecret;
    return sanitized;
  }
}

export default new AdminStatsService();
