import express from 'express';
import analyticsArchiveController from '../controllers/analyticsArchiveController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes protégées, nécessitant une authentification admin
router.use(authMiddleware.authenticate, authMiddleware.requireAdmin);

// Récupérer la liste des archives avec filtres avancés
router.get('/', analyticsArchiveController.listArchives);

// Statistiques globales des archives
router.get('/stats', analyticsArchiveController.getArchiveStats);

// Détails d'une archive spécifique
router.get('/:archiveId', analyticsArchiveController.getArchiveDetails);

// Créer une archive manuellement
router.post('/', analyticsArchiveController.createManualArchive);

// Supprimer une archive
router.delete('/:archiveId', analyticsArchiveController.deleteArchive);

// Exporter une archive
router.get('/:archiveId/export', analyticsArchiveController.exportArchive);

// Générer des rapports personnalisés
router.get('/reports/custom', analyticsArchiveController.generateCustomReport);

// Exporter un rapport personnalisé
router.get('/reports/export', analyticsArchiveController.exportReport);

export default router;
