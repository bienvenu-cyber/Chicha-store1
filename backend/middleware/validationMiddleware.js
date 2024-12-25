import { body, validationResult } from 'express-validator';

export default class ValidationMiddleware {
  // Validation de l'inscription
  static validateRegistration() {
    return [
      body('email')
        .isEmail().withMessage('Email invalide')
        .normalizeEmail(),
      
      body('firstName')
        .trim()
        .isLength({ min: 2 }).withMessage('Prénom trop court')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Prénom invalide'),
      
      body('lastName')
        .trim()
        .isLength({ min: 2 }).withMessage('Nom trop court')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Nom invalide'),
      
      body('password')
        .isLength({ min: 8 }).withMessage('Mot de passe trop court')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Mot de passe trop faible'),
      
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          return true;
        }),

      this.handleValidationErrors
    ];
  }

  // Validation de la mise à jour du profil
  static validateProfileUpdate() {
    return [
      body('email')
        .optional()
        .isEmail().withMessage('Email invalide')
        .normalizeEmail(),
      
      body('phoneNumber')
        .optional()
        .isMobilePhone().withMessage('Numéro de téléphone invalide'),
      
      body('address.street')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('Adresse trop courte'),
      
      body('address.postalCode')
        .optional()
        .isPostalCode('FR').withMessage('Code postal invalide'),

      this.handleValidationErrors
    ];
  }

  // Validation de création de produit
  static validateProductCreation() {
    return [
      body('name')
        .trim()
        .isLength({ min: 3 }).withMessage('Nom du produit trop court'),
      
      body('price')
        .isFloat({ min: 0 }).withMessage('Prix invalide'),
      
      body('category')
        .trim()
        .notEmpty().withMessage('Catégorie requise'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10 }).withMessage('Description trop courte'),

      this.handleValidationErrors
    ];
  }

  // Validation de commande
  static validateOrderCreation() {
    return [
      body('products')
        .isArray({ min: 1 }).withMessage('Panier vide'),
      
      body('products.*.productId')
        .isMongoId().withMessage('ID de produit invalide'),
      
      body('products.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantité invalide'),
      
      body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Adresse de livraison requise'),
      
      body('paymentMethod')
        .isIn(['credit_card', 'paypal', 'stripe']).withMessage('Méthode de paiement invalide'),

      this.handleValidationErrors
    ];
  }

  // Gestion des erreurs de validation
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    next();
  }

  // Validation générique
  static validate(validations) {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      res.status(400).json({ 
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    };
  }
}

export default ValidationMiddleware;
