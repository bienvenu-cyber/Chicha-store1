import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchArticles, Article } from '../services/articleService';

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ 
  currentArticleId, 
  category 
}) => {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRelatedArticles = async () => {
      try {
        const allArticles = await fetchArticles();
        const related = allArticles
          .filter(article => 
            article.category === category && 
            article.id !== currentArticleId
          )
          .slice(0, 3); // Limiter à 3 articles connexes

        setRelatedArticles(related);
      } catch (error) {
        console.error('Erreur lors du chargement des articles connexes', error);
      }
    };

    loadRelatedArticles();
  }, [currentArticleId, category]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/articles/${articleId}`);
  };

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        Articles similaires
      </Typography>

      <Grid container spacing={3}>
        {relatedArticles.map((article) => (
          <Grid item xs={12} sm={4} key={article.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
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
                    variant="h6" 
                    component="div"
                    sx={{ 
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      fontWeight: 'bold'
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
                      WebkitLineClamp: 2
                    }}
                  >
                    {article.content.slice(0, 100)}...
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RelatedArticles;
