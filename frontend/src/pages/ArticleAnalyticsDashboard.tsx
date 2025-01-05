import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  fetchArticleAnalytics, 
  fetchTopArticles, 
  ArticleAnalytics 
} from '../services/articleAnalyticsService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const ArticleAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [topArticles, setTopArticles] = useState<Array<ArticleAnalytics & { title: string }>>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleAnalytics | null>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier les permissions d'administration
    if (!user?.isAdmin) {
      showNotification('Accès non autorisé', 'error');
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const articles = await fetchTopArticles({ period });
        setTopArticles(articles);
        
        // Charger les analytics du premier article par défaut
        if (articles.length > 0) {
          const details = await fetchArticleAnalytics(articles[0].articleId);
          setSelectedArticle(details);
        }
      } catch (error) {
        showNotification('Erreur de chargement des analytics', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period, user]);

  const handleArticleSelect = async (articleId: string) => {
    try {
      const details = await fetchArticleAnalytics(articleId);
      setSelectedArticle(details);
    } catch (error) {
      showNotification('Erreur de chargement des détails', 'error');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Container maxWidth="lg">
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics des Articles
      </Typography>

      {/* Période de reporting */}
      <Box sx={{ mb: 3 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            label="Période"
          >
            <MenuItem value="daily">Quotidien</MenuItem>
            <MenuItem value="weekly">Hebdomadaire</MenuItem>
            <MenuItem value="monthly">Mensuel</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Top Articles */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Articles
            </Typography>
            {topArticles.map((article, index) => (
              <Box 
                key={article.articleId} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  p: 1,
                  borderRadius: 1
                }}
                onClick={() => handleArticleSelect(article.articleId)}
              >
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {index + 1}. {article.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {article.views} vues
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Statistiques détaillées */}
        <Grid item xs={12} md={8}>
          {selectedArticle && (
            <Grid container spacing={3}>
              {/* Vues et Engagement */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Vues et Engagement</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Vues', value: selectedArticle.views },
                        { name: 'Vues Uniques', value: selectedArticle.uniqueViews },
                        { name: 'Likes', value: selectedArticle.likes },
                        { name: 'Commentaires', value: selectedArticle.comments }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Distribution des Partages */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Partages</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(selectedArticle.shareCount).map(([platform, count]) => ({
                            name: platform.charAt(0).toUpperCase() + platform.slice(1),
                            value: count
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.keys(selectedArticle.shareCount).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Temps de Lecture */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Distribution du Temps de Lecture</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={selectedArticle.readTimeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ArticleAnalyticsDashboard;
