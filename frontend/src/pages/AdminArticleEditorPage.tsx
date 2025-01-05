import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  Paper
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createArticle, 
  fetchArticleById, 
  Article 
} from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ImageUploader from '../components/ImageUploader';

const AdminArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    content: '',
    category: 'chicha',
    tags: [],
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger l'article existant si un ID est fourni
    const loadArticle = async () => {
      if (id) {
        try {
          const existingArticle = await fetchArticleById(id);
          setArticle(existingArticle);
        } catch (error) {
          showNotification('Erreur de chargement de l\'article', 'error');
        }
      }
    };

    loadArticle();
  }, [id]);

  // Vérifier les permissions d'administration
  useEffect(() => {
    if (!user || !user.isAdmin) {
      showNotification('Accès non autorisé', 'error');
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setArticle(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setArticle(prev => ({
      ...prev,
      imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!article.title || !article.content) {
      showNotification('Titre et contenu sont requis', 'error');
      return;
    }

    setLoading(true);

    try {
      // Préparer les données de l'article
      const articleData = {
        ...article,
        author: user?.name || 'Administrateur',
        publishedAt: new Date().toISOString(),
        likes: 0
      } as Omit<Article, 'id'>;

      // Créer ou mettre à jour l'article
      const savedArticle = await createArticle(articleData);
      
      showNotification(
        id ? 'Article mis à jour' : 'Article créé', 
        'success'
      );
      
      // Rediriger vers la page de détail de l'article
      navigate(`/articles/${savedArticle.id}`);
    } catch (error) {
      showNotification('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'chicha', 
    'tabac', 
    'lifestyle', 
    'conseil'
  ];

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ mb: 3, textAlign: 'center' }}
        >
          {id ? 'Modifier l\'article' : 'Créer un article'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={article.title}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={article.category}
                  onChange={handleChange}
                  label="Catégorie"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags (séparés par des virgules)"
                name="tags"
                value={article.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim());
                  setArticle(prev => ({ ...prev, tags }));
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <ImageUploader 
                onImageUpload={handleImageUpload}
                initialImageUrl={article.imageUrl}
                label="Image de couverture"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contenu"
                name="content"
                value={article.content}
                onChange={handleChange}
                required
                multiline
                rows={10}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading 
                  ? 'Enregistrement...' 
                  : (id ? 'Mettre à jour' : 'Créer')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminArticleEditorPage;
