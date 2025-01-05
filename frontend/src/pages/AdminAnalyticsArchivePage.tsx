import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download as DownloadIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon 
} from '@mui/icons-material';

import { AnalyticsArchiveService } from '../services/analyticsArchiveService';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const AdminAnalyticsArchivePage: React.FC = () => {
  const [archives, setArchives] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [archiveType, setArchiveType] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArchive, setSelectedArchive] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Vérification des permissions
  useEffect(() => {
    if (!user?.isAdmin) {
      showNotification('Accès non autorisé', 'error');
      return;
    }
  }, [user]);

  // Charger les archives
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        setLoading(true);
        const response = await AnalyticsArchiveService.listArchives({
          page,
          archiveType: archiveType || undefined
        });

        setArchives(response.archives);
        setTotalPages(response.totalPages);
      } catch (error) {
        showNotification('Erreur de chargement des archives', 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const statsData = await AnalyticsArchiveService.getArchiveStats();
        setStats(statsData);
      } catch (error) {
        showNotification('Erreur de chargement des statistiques', 'error');
      }
    };

    fetchArchives();
    fetchStats();
  }, [page, archiveType]);

  // Exporter une archive
  const handleExport = async (archiveId: string, format: 'json' | 'csv' = 'json') => {
    try {
      const blob = await AnalyticsArchiveService.exportArchive(archiveId, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archive_${archiveId}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showNotification('Erreur lors de l\'exportation', 'error');
    }
  };

  // Supprimer une archive
  const handleDelete = async () => {
    if (!selectedArchive) return;

    try {
      await AnalyticsArchiveService.deleteArchive(selectedArchive._id);
      showNotification('Archive supprimée avec succès', 'success');
      setDeleteConfirmOpen(false);
      
      // Recharger les archives
      const response = await AnalyticsArchiveService.listArchives({
        page,
        archiveType: archiveType || undefined
      });
      setArchives(response.archives);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Données pour le graphique de statistiques
  const chartData = useMemo(() => {
    return stats.map(stat => ({
      name: stat._id,
      Archives: stat.totalArchives,
      Articles: stat.totalArticles,
      Événements: stat.totalEvents.view + 
                  stat.totalEvents.like + 
                  stat.totalEvents.comment + 
                  stat.totalEvents.share
    }));
  }, [stats]);

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
        Archives Analytics
      </Typography>

      {/* Filtres et Statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Type d'Archive</InputLabel>
            <Select
              value={archiveType}
              onChange={(e) => setArchiveType(e.target.value as string)}
              label="Type d'Archive"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="daily">Quotidien</MenuItem>
              <MenuItem value="weekly">Hebdomadaire</MenuItem>
              <MenuItem value="monthly">Mensuel</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={8}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="Archives" fill="#8884d8" />
              <Bar dataKey="Articles" fill="#82ca9d" />
              <Bar dataKey="Événements" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>

      {/* Liste des Archives */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Période</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell>Événements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archives.map((archive) => (
              <TableRow key={archive._id}>
                <TableCell>
                  <Chip 
                    label={archive.archiveType} 
                    color={
                      archive.archiveType === 'daily' ? 'primary' :
                      archive.archiveType === 'weekly' ? 'secondary' : 
                      'default'
                    } 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {new Date(archive.periodStart).toLocaleDateString()} - 
                  {new Date(archive.periodEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>{archive.globalStats.totalArticles}</TableCell>
                <TableCell>
                  {Object.values(archive.globalStats.totalEvents).reduce((a, b) => a + b, 0)}
                </TableCell>
                <TableCell>
                  <Tooltip title="Détails">
                    <IconButton 
                      color="primary"
                      onClick={() => setSelectedArchive(archive)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exporter (JSON)">
                    <IconButton 
                      color="secondary"
                      onClick={() => handleExport(archive._id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton 
                      color="error"
                      onClick={() => {
                        setSelectedArchive(archive);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cette archive ?
          Cette action est irréversible.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="primary"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de détails de l'archive */}
      {selectedArchive && (
        <Dialog
          open={!!selectedArchive}
          onClose={() => setSelectedArchive(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Détails de l'Archive</DialogTitle>
          <DialogContent>
            <Typography variant="h6">
              {selectedArchive.archiveType.toUpperCase()} - 
              {new Date(selectedArchive.periodStart).toLocaleDateString()} à 
              {new Date(selectedArchive.periodEnd).toLocaleDateString()}
            </Typography>
            
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Articles</TableCell>
                    <TableCell>Vues</TableCell>
                    <TableCell>Likes</TableCell>
                    <TableCell>Commentaires</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedArchive.articleAnalytics?.map((article: any) => (
                    <TableRow key={article.articleId}>
                      <TableCell>{article.title}</TableCell>
                      <TableCell>{article.totalEvents.view}</TableCell>
                      <TableCell>{article.totalEvents.like}</TableCell>
                      <TableCell>{article.totalEvents.comment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setSelectedArchive(null)}
              color="primary"
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default AdminAnalyticsArchivePage;
