import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  TextField,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

import { AnalyticsArchiveService } from '../services/analyticsArchiveService';
import { ArticleService } from '../services/articleService';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const CustomAnalyticsReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<'engagement' | 'readTime' | 'topPerforming'>('engagement');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [articles, setArticles] = useState<Array<{id: string, title: string}>>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Vérification des permissions
  useEffect(() => {
    if (!user?.isAdmin) {
      showNotification('Accès non autorisé', 'error');
      return;
    }
  }, [user]);

  // Charger la liste des articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articleList = await ArticleService.listArticles();
        setArticles(articleList.map(article => ({
          id: article._id,
          title: article.title
        })));
      } catch (error) {
        showNotification('Erreur de chargement des articles', 'error');
      }
    };

    fetchArticles();
  }, []);

  // Générer le rapport
  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      showNotification('Veuillez sélectionner des dates', 'warning');
      return;
    }

    try {
      setLoading(true);
      const report = await AnalyticsArchiveService.generateCustomReport({
        reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        articleIds: selectedArticles.length > 0 ? selectedArticles : undefined,
        groupBy: reportType !== 'topPerforming' ? groupBy : undefined
      });

      setReportData(report);
      showNotification('Rapport généré avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la génération du rapport', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Exporter le rapport
  const handleExportReport = async (format: 'json' | 'csv' = 'csv') => {
    if (!startDate || !endDate) {
      showNotification('Veuillez sélectionner des dates', 'warning');
      return;
    }

    try {
      const blob = await AnalyticsArchiveService.exportReport({
        reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_${reportType}_${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showNotification('Erreur lors de l\'exportation du rapport', 'error');
    }
  };

  // Rendu des graphiques selon le type de rapport
  const renderChart = () => {
    if (loading) {
      return <CircularProgress />;
    }

    if (reportData.length === 0) {
      return <Typography>Aucune donnée disponible</Typography>;
    }

    switch (reportType) {
      case 'engagement':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalViews" stroke="#8884d8" name="Vues" />
              <Line type="monotone" dataKey="totalLikes" stroke="#82ca9d" name="Likes" />
              <Line type="monotone" dataKey="totalComments" stroke="#ffc658" name="Commentaires" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'readTime':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageReadTime" stroke="#8884d8" name="Temps de lecture moyen" />
              <Line type="monotone" dataKey="totalReadTime" stroke="#82ca9d" name="Temps total de lecture" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'topPerforming':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="engagementScore" stroke="#8884d8" name="Score d'engagement" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={fr}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rapports Analytics Personnalisés
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de Rapport</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  label="Type de Rapport"
                >
                  <MenuItem value="engagement">Engagement</MenuItem>
                  <MenuItem value="readTime">Temps de Lecture</MenuItem>
                  <MenuItem value="topPerforming">Top Articles</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Date de début"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Date de fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>

            {reportType !== 'topPerforming' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Grouper par</InputLabel>
                  <Select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    label="Grouper par"
                  >
                    <MenuItem value="daily">Jour</MenuItem>
                    <MenuItem value="weekly">Semaine</MenuItem>
                    <MenuItem value="monthly">Mois</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={articles}
                getOptionLabel={(option) => option.title}
                value={articles.filter(article => 
                  selectedArticles.includes(article.id)
                )}
                onChange={(_, newValue) => {
                  setSelectedArticles(newValue.map(v => v.id));
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    variant="outlined" 
                    label="Filtrer par Articles" 
                    placeholder="Sélectionnez des articles"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleGenerateReport}
                  disabled={loading}
                >
                  {loading ? 'Génération...' : 'Générer le Rapport'}
                </Button>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    sx={{ mr: 2 }}
                    onClick={() => handleExportReport('json')}
                    disabled={reportData.length === 0}
                  >
                    Exporter JSON
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => handleExportReport('csv')}
                    disabled={reportData.length === 0}
                  >
                    Exporter CSV
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Résultats du Rapport
          </Typography>
          {renderChart()}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CustomAnalyticsReportPage;
