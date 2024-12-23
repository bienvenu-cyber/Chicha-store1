class PermissionMiddleware {
  // Vérification du rôle SuperAdmin
  requireSuperAdminRole(req, res, next) {
    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        message: 'Accès refusé. Droits de SuperAdmin requis.'
      });
    }
    next();
  }

  // Vérification des permissions de gestion de produits
  checkProductManagementAccess(req, res, next) {
    if (!req.user.permissions.produits) {
      return res.status(403).json({
        message: 'Accès refusé. Permissions de gestion de produits requises.'
      });
    }
    next();
  }

  // Vérification des permissions de gestion des utilisateurs
  checkUserManagementAccess(req, res, next) {
    if (!req.user.permissions.utilisateurs) {
      return res.status(403).json({
        message: 'Accès refusé. Permissions de gestion des utilisateurs requises.'
      });
    }
    next();
  }

  // Vérification des permissions de gestion des commandes
  checkOrderManagementAccess(req, res, next) {
    if (!req.user.permissions.commandes) {
      return res.status(403).json({
        message: 'Accès refusé. Permissions de gestion des commandes requises.'
      });
    }
    next();
  }

  // Vérification des permissions marketing
  checkMarketingAccess(req, res, next) {
    if (!req.user.permissions.marketing) {
      return res.status(403).json({
        message: 'Accès refusé. Permissions marketing requises.'
      });
    }
    next();
  }

  // Vérification des permissions financières
  checkFinanceAccess(req, res, next) {
    if (!req.user.permissions.finance) {
      return res.status(403).json({
        message: 'Accès refusé. Permissions financières requises.'
      });
    }
    next();
  }

  // Vérification des accès au tableau de bord
  checkDashboardAccess(req, res, next) {
    const dashboardRoles = [
      'SuperAdmin', 
      'AdminProduit', 
      'AdminMarketing', 
      'AdminFinance'
    ];

    if (!dashboardRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Accès refusé. Rôle administratif requis.'
      });
    }
    next();
  }

  // Vérification des permissions personnalisées
  hasPermission(requiredPermissions) {
    return (req, res, next) => {
      const hasRequiredPermissions = requiredPermissions.every(
        permission => req.user.permissions[permission]
      );

      if (!hasRequiredPermissions) {
        return res.status(403).json({
          message: 'Accès refusé. Permissions insuffisantes.'
        });
      }
      next();
    };
  }

  // Journalisation des actions administratives
  logAdminAction(action) {
    return (req, res, next) => {
      // TODO: Implémenter la journalisation des actions admin
      console.log(`Admin ${req.user.id} a effectué l'action : ${action}`);
      next();
    };
  }
}

module.exports = new PermissionMiddleware();
