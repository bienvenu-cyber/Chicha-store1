import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  CardActionArea,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchArticles, Article } from '../services/articleService';
import { useNotification } from '../contexts/NotificationContext';

const ArticlesList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const fetchedArticles = await fetchArticles();
        setArticles(fetchedArticles);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les articles');
        showNotification('Erreur de chargement des articles', 'error');
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Filtrage des articles
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (searchTerm) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(article => article.category === category);
    }

    // Trier par date de publication la plus récente
    result.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return result;
  }, [articles, searchTerm, category]);

  // Pagination
  const paginatedArticles = useMemo(() => {
    const startIndex = (page - 1) * articlesPerPage;
    return filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  }, [filteredArticles, page]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/articles/${articleId}`);
  };

  const categories = [
    'chicha', 
    'tabac', 
    'lifestyle', 
    'conseil'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Blog & Articles
      </Typography>

      {/* Filtres */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 3, 
        alignItems: 'center' 
      }}>
        <TextField
          label="Rechercher des articles"
          variant="outlined"
          fullWidth
          sx={{ maxWidth: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={category}
            label="Catégorie"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Filtres actifs */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {category && (
          <Chip 
            label={`Catégorie: ${category}`} 
            onDelete={() => setCategory('')} 
          />
        )}
        {searchTerm && (
          <Chip 
            label={`Recherche: ${searchTerm}`} 
            onDelete={() => setSearchTerm('')} 
          />
        )}
      </Stack>

      {/* Grille d'articles */}
      <Grid container spacing={3}>
        {paginatedArticles.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              Aucun article trouvé
            </Typography>
          </Grid>
        ) : (
          paginatedArticles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <CardActionArea 
                  onClick={() => handleArticleClick(article.id)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.imageUrl || '/default-article.jpg'}
                    alt={article.title}
                  />
                  <CardContent>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="div"
                      sx={{ 
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3
                      }}
                    >
                      {article.content}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {article.author}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 4 
      }}>
        <Pagination
          count={Math.ceil(filteredArticles.length / articlesPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ArticlesList;
