const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class ImageUploadService {
    constructor() {
        this.uploadPath = path.join(__dirname, '../uploads/products');
        this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.maxFileSize = 5 * 1024 * 1024; // 5 Mo
    }

    // Configuration de Multer pour le téléchargement
    configureMulter() {
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                await fs.mkdir(this.uploadPath, { recursive: true });
                cb(null, this.uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        });

        return multer({
            storage: storage,
            fileFilter: this.fileFilter.bind(this),
            limits: { fileSize: this.maxFileSize }
        });
    }

    // Filtre de fichiers
    fileFilter(req, file, cb) {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'), false);
        }
    }

    // Redimensionnement et optimisation des images
    async processImage(filePath) {
        const processedImagePath = path.join(
            this.uploadPath, 
            `processed_${path.basename(filePath)}`
        );

        await sharp(filePath)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(processedImagePath);

        return processedImagePath;
    }

    // Suppression des images
    async deleteImage(imagePath) {
        try {
            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Erreur de suppression d\'image:', error);
        }
    }

    // Génération d'URL d'image
    generateImageUrl(filename) {
        return `/uploads/products/${filename}`;
    }
}

module.exports = new ImageUploadService();
