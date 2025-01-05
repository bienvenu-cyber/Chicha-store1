import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Divider, 
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import { 
  ThumbUp as LikeIcon, 
  ThumbUpOutlined as LikeOutlinedIcon 
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { 
  fetchArticleById, 
  Article, 
  Comment,
  likeArticle 
} from '../services/articleService';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import ShareButtons from '../components/ShareButtons';
import RelatedArticles from '../components/RelatedArticles';
import ArticleComments from '../components/ArticleComments';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        setError('ID de l\'article manquant');
        setLoading(false);
        return;
      }

      try {
        const fetchedArticle = await fetchArticleById(id);
        setArticle(fetchedArticle);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger l\'article');
        showNotification('Erreur de chargement de l\'article', 'error');
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const handleLikeArticle = async () => {
    if (!user) {
      showNotification('Vous devez être connecté pour liker', 'error');
      return;
    }

    if (!article) return;

    try {
      const updatedArticle = await likeArticle(article.id);
      setArticle(updatedArticle);
      showNotification(
        updatedArticle.userLiked ? 'Article liké' : 'Like retiré', 
        'success'
      );
    } catch (error) {
      showNotification('Erreur lors du like', 'error');
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    if (!article) return;
    
    setArticle({
      ...article,
      comments: [...(article.comments || []), newComment]
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="error" align="center">
          {error || 'Article non trouvé'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        {/* Image de l'article */}
        {article.imageUrl && (
          <Box 
            component="img"
            src={article.imageUrl}
            alt={article.title}
            sx={{
              width: '100%',
              maxHeight: 500,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 3
            }}
          />
        )}

        {/* En-tête de l'article */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            {article.title}
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  mr: 2,
                  bgcolor: 'primary.main' 
                }}
              >
                {article.author.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {article.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Publié le {new Date(article.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={article.category} 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }}
              />
              
              <IconButton 
                color={article.userLiked ? 'primary' : 'default'}
                onClick={handleLikeArticle}
              >
                {article.userLiked ? <LikeIcon /> : <LikeOutlinedIcon />}
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {article.likes}
                </Typography>
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Contenu de l'article */}
        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.1rem' }
          }}
        >
          {article.content}
        </Typography>

        {/* Boutons de partage */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <ShareButtons 
            title={article.title} 
            url={window.location.href} 
          />
        </Box>

        {/* Commentaires */}
        <ArticleComments 
          articleId={article.id} 
          comments={article.comments || []} 
          onCommentAdded={handleCommentAdded}
        />

        {/* Articles connexes */}
        <RelatedArticles 
          currentArticleId={article.id} 
          category={article.category} 
        />
      </Paper>
    </Container>
  );
};

export default ArticleDetailPage;
