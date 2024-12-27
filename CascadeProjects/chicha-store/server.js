const express = import('express');
const path = import('path');
const app = express();

// Servir les fichiers statiques
app.use(express.static('frontend'));
app.use('/backend/data', express.static('backend/data'));

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
