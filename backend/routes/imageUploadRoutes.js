import express from 'express';
const router = express.Router();
import ImageUploadService from '../services/imageUploadService.js.js';
import Product from '../models/Product.js.js';
import authMiddleware from '../middleware/authMiddleware.js.js';

// Configuration de Multer pour le téléchargement
const upload = ImageUploadService.configureMulter();

// Route de téléchargement d'image de produit
router.post('/product', 
    authMiddleware.requireAuth, 
    authMiddleware.checkUserRole(['admin', 'manager']),
    upload.array('images', 5),
    async (req, res) => {
        try {
            const { productId } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'Aucune image téléchargée' });
            }

            const processedImages = await Promise.all(
                files.map(async (file) => {
                    const processedPath = await ImageUploadService.processImage(file.path);
                    return {
                        url: ImageUploadService.generateImageUrl(path.basename(processedPath)),
                        alt: `Image de ${productId}`,
                        isPrimary: files.indexOf(file) === 0
                    };
                })
            );

            // Mise à jour du produit avec les nouvelles images
            const product = await Product.findByIdAndUpdate(
                productId, 
                { $push: { images: { $each: processedImages } } },
                { new: true }
            );

            res.status(200).json({
                message: 'Images téléchargées avec succès',
                product
            });
        } catch (error) {
            console.error('Erreur de téléchargement d\'image:', error);
            res.status(500).json({ message: 'Erreur de téléchargement', error: error.message });
        }
    }
);

// Route de suppression d'image
router.delete('/product/:productId/image/:imageId', 
    authMiddleware.requireAuth, 
    authMiddleware.checkUserRole(['admin', 'manager']),
    async (req, res) => {
        try {
            const { productId, imageId } = req.params;

            const product = await Product.findByIdAndUpdate(
                productId,
                { $pull: { images: { _id: imageId } } },
                { new: true }
            );

            if (!product) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            res.status(200).json({
                message: 'Image supprimée avec succès',
                product
            });
        } catch (error) {
            console.error('Erreur de suppression d\'image:', error);
            res.status(500).json({ message: 'Erreur de suppression', error: error.message });
        }
    }
);

export default router;
