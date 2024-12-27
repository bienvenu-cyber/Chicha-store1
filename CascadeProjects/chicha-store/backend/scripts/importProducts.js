const axios = import('axios');
const cheerio = import('cheerio');
const fs = import('fs').promises;
const path = import('path');

class ProductImporter {
    constructor() {
        this.sources = {
            hookah: [
                'https://api.hookah-shisha.com/v1/products',
                'https://api.hookahjohn.com/products',
                'https://api.5starhookah.com/products'
            ],
            aliexpress: {
                url: 'https://api.aliexpress.com/v1/products/search',
                categories: ['hookah', 'shisha', 'water pipe']
            }
        };
        this.products = [];
    }

    async init() {
        try {
            // Charger les produits existants
            const existingData = await fs.readFile(
                path.join(__dirname, '../data/products.json'),
                'utf-8'
            );
            this.existingProducts = JSON.parse(existingData);
        } catch (error) {
            console.error('Erreur lors du chargement des produits existants:', error);
            this.existingProducts = { products: [] };
        }
    }

    async scrapeHookahSites() {
        const sites = [
            {
                url: 'https://www.el-badia.com',
                selectors: {
                    products: '.product-item',
                    name: '.product-name',
                    price: '.price',
                    description: '.description',
                    image: '.product-image img'
                }
            },
            {
                url: 'https://www.chicha-narguilé.com',
                selectors: {
                    products: '.product',
                    name: '.product-title',
                    price: '.product-price',
                    description: '.product-description',
                    image: '.product-image img'
                }
            }
            // Ajoutez d'autres sites ici
        ];

        for (const site of sites) {
            try {
                const response = await axios.get(site.url);
                const $ = cheerio.load(response.data);
                
                $(site.selectors.products).each((i, elem) => {
                    const product = {
                        id: `chc${Math.random().toString(36).substr(2, 6)}`,
                        name: $(elem).find(site.selectors.name).text().trim(),
                        price: this.extractPrice($(elem).find(site.selectors.price).text()),
                        description: $(elem).find(site.selectors.description).text().trim(),
                        image: $(elem).find(site.selectors.image).attr('src'),
                        source: site.url,
                        dateImported: new Date().toISOString()
                    };

                    if (this.isValidProduct(product)) {
                        this.products.push(this.normalizeProduct(product));
                    }
                });
            } catch (error) {
                console.error(`Erreur lors du scraping de ${site.url}:`, error);
            }
        }
    }

    async fetchFromAPIs() {
        // Exemple avec l'API d'AliExpress (nécessite une clé API)
        const aliExpressKey = process.env.ALIEXPRESS_API_KEY;
        if (aliExpressKey) {
            for (const category of this.sources.aliexpress.categories) {
                try {
                    const response = await axios.get(this.sources.aliexpress.url, {
                        params: {
                            api_key: aliExpressKey,
                            category,
                            limit: 100
                        }
                    });

                    const products = response.data.products.map(p => ({
                        id: `chc${Math.random().toString(36).substr(2, 6)}`,
                        name: p.title,
                        price: this.convertToLocalCurrency(p.price),
                        description: p.description,
                        image: p.image_url,
                        source: 'aliexpress',
                        dateImported: new Date().toISOString()
                    }));

                    this.products.push(...products.filter(p => this.isValidProduct(p)));
                } catch (error) {
                    console.error(`Erreur lors de la récupération depuis AliExpress (${category}):`, error);
                }
            }
        }
    }

    normalizeProduct(product) {
        // Normaliser les données du produit
        return {
            ...product,
            category: this.detectCategory(product),
            subcategory: this.detectSubcategory(product),
            specifications: this.extractSpecifications(product),
            features: this.extractFeatures(product),
            stock: Math.floor(Math.random() * 20) + 5, // Stock aléatoire pour l'exemple
            rating: (Math.random() * 2 + 3).toFixed(1), // Note entre 3 et 5
            reviewCount: Math.floor(Math.random() * 100)
        };
    }

    detectCategory(product) {
        const name = product.name.toLowerCase();
        if (name.includes('premium') || name.includes('luxe')) return 'premium';
        if (name.includes('moderne') || name.includes('led')) return 'modern';
        if (name.includes('charbon') || name.includes('tuyau')) return 'accessories';
        return 'standard';
    }

    detectSubcategory(product) {
        const name = product.name.toLowerCase();
        if (name.includes('charbon')) return 'charbon';
        if (name.includes('tuyau')) return 'tuyaux';
        if (name.includes('foyer')) return 'foyers';
        if (name.includes('portable')) return 'portable';
        return 'traditionnelle';
    }

    extractSpecifications(product) {
        const specs = {};
        const description = product.description.toLowerCase();

        // Extraire la hauteur
        const heightMatch = description.match(/(\d+)\s*cm/);
        if (heightMatch) specs.height = `${heightMatch[1]}cm`;

        // Extraire le matériau
        if (description.includes('acier')) specs.material = 'Acier inoxydable';
        else if (description.includes('verre')) specs.material = 'Verre';
        else if (description.includes('aluminium')) specs.material = 'Aluminium';

        // Nombre de tuyaux
        if (description.includes('double')) specs.hoseCount = 2;
        else specs.hoseCount = 1;

        return specs;
    }

    extractFeatures(product) {
        const features = [];
        const description = product.description.toLowerCase();

        if (description.includes('led')) features.push('Éclairage LED');
        if (description.includes('portable')) features.push('Portable');
        if (description.includes('inoxydable')) features.push('Acier inoxydable');
        if (description.includes('silicone')) features.push('Tuyau en silicone');

        return features;
    }

    isValidProduct(product) {
        return (
            product.name &&
            product.price &&
            product.description &&
            product.image &&
            !this.existingProducts.products.some(p => p.name === product.name)
        );
    }

    extractPrice(priceStr) {
        const numbers = priceStr.match(/\d+([.,]\d+)?/);
        return numbers ? parseFloat(numbers[0].replace(',', '.')) : 0;
    }

    convertToLocalCurrency(price) {
        // Conversion en FCFA (exemple)
        return Math.round(price * 655.957); // Taux de conversion EUR -> FCFA
    }

    async saveProducts() {
        try {
            // Fusionner avec les produits existants
            const allProducts = {
                products: [...this.existingProducts.products, ...this.products],
                categories: this.existingProducts.categories,
                subcategories: this.existingProducts.subcategories
            };

            await fs.writeFile(
                path.join(__dirname, '../data/products.json'),
                JSON.stringify(allProducts, null, 2),
                'utf-8'
            );

            console.log(`${this.products.length} nouveaux produits importés avec succès!`);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des produits:', error);
        }
    }

    async downloadImages() {
        const imageDir = path.join(__dirname, '../public/images/products');
        
        // Créer le dossier s'il n'existe pas
        try {
            await fs.mkdir(imageDir, { recursive: true });
        } catch (error) {
            console.error('Erreur lors de la création du dossier images:', error);
        }

        // Télécharger les images
        for (const product of this.products) {
            try {
                const response = await axios({
                    url: product.image,
                    responseType: 'arraybuffer'
                });

                const imageName = `${product.id}-${Date.now()}.jpg`;
                const imagePath = path.join(imageDir, imageName);

                await fs.writeFile(imagePath, response.data);
                product.image = `/images/products/${imageName}`;
            } catch (error) {
                console.error(`Erreur lors du téléchargement de l'image pour ${product.name}:`, error);
            }
        }
    }

    async import() {
        console.log('Démarrage de l\'importation...');
        await this.init();
        await this.scrapeHookahSites();
        await this.fetchFromAPIs();
        await this.downloadImages();
        await this.saveProducts();
        console.log('Importation terminée!');
    }
}

// Exécution
const importer = new ProductImporter();
importer.import().catch(console.error);
