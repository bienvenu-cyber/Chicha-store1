const fs = import('fs').promises;
import path from 'path';
import sharp from 'sharp';

// Configurations des images
const imageConfigs = [
    {
        name: 'chicha-alpha-1',
        width: 800,
        height: 600,
        background: '#2C3E50',
        text: 'Chicha Alpha'
    },
    {
        name: 'chicha-alpha-2',
        width: 800,
        height: 600,
        background: '#34495E',
        text: 'Détails Technique'
    },
    {
        name: 'pack-debutant-1',
        width: 800,
        height: 600,
        background: '#7F8C8D',
        text: 'Pack Débutant'
    },
    {
        name: 'tabac-exotic-1',
        width: 800,
        height: 600,
        background: '#27AE60',
        text: 'Tabac Exotic'
    }
];

async function generateDemoImages() {
    const uploadDir = path.join(__dirname, '../uploads/products');
    
    // Créer le dossier s'il n'existe pas
    await fs.mkdir(uploadDir, { recursive: true });

    for (const config of imageConfigs) {
        const imagePath = path.join(uploadDir, `${config.name}.webp`);

        await sharp({
            create: {
                width: config.width,
                height: config.height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .webp({ quality: 80 })
        .composite([
            {
                input: Buffer.from(`
                    <svg width="${config.width}" height="${config.height}">
                        <rect width="100%" height="100%" fill="${config.background}"/>
                        <text 
                            x="50%" 
                            y="50%" 
                            text-anchor="middle" 
                            fill="white" 
                            font-size="50" 
                            font-family="Arial"
                        >
                            ${config.text}
                        </text>
                    </svg>
                `),
                input: Buffer.from(`
                    <svg width="${config.width}" height="${config.height}">
                        <rect width="100%" height="100%" fill="${config.background}"/>
                        <text 
                            x="50%" 
                            y="50%" 
                            text-anchor="middle" 
                            fill="white" 
                            font-size="50" 
                            font-family="Arial"
                        >
                            ${config.text}
                        </text>
                    </svg>
                `)
            }
        ])
        .toFile(imagePath);

        console.log(`Image générée : ${config.name}.webp`);
    }
}

generateDemoImages()
    .then(() => console.log('Génération des images de démonstration terminée'))
    .catch(console.error);
