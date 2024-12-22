import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';

interface TransactionRisk {
  _id: string;
  transaction: any;
  user: {
    fullName: string;
    email: string;
  };
  overallRiskAssessment: {
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  verificationResults: Array<{
    service: string;
    status: string;
    details: any;
  }>;
}

export const PaymentRiskManagement: React.FC = () => {
  const [risks, setRisks] = useState<TransactionRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<TransactionRisk | null>(null);
  const [riskSummary, setRiskSummary] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactionRisks();
  }, []);

  const fetchTransactionRisks = async () => {
    try {
      const response = await axios.get('/api/admin/payment-risks');
      setRisks(response.data.risks);
      setRiskSummary(response.data.summary);
    } catch (error) {
      console.error('Erreur de récupération des risques', error);
    }
  };

  const handleRiskReview = async (action: string) => {
    if (!selectedRisk) return;

    try {
      await axios.post('/api/admin/review-risk', {
        transactionRiskId: selectedRisk._id,
        action,
        reviewNotes: 'Révision manuelle'
      });

      fetchTransactionRisks();
      setSelectedRisk(null);
    } catch (error) {
      console.error('Erreur de révision du risque', error);
    }
  };

  const renderRiskLevelBadge = (level: string) => {
    const colorMap = {
      'LOW': 'green',
      'MEDIUM': 'orange',
      'HIGH': 'red',
      'CRITICAL': 'darkred'
    };

    return (
      <Box 
        sx={{ 
          backgroundColor: colorMap[level], 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px' 
        }}
      >
        {level}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4">Gestion des Risques de Paiement</Typography>

      <Grid container spacing={2}>
        {riskSummary.map(summary => (
          <Grid item xs={3} key={summary._id}>
            <Card>
              <CardContent>
                <Typography>
                  Risque {summary._id}: {summary.count} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Transaction</TableCell>
              <TableCell>Niveau de Risque</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {risks.map(risk => (
              <TableRow key={risk._id}>
                <TableCell>{risk.user.fullName}</TableCell>
                <TableCell>{risk.transaction._id}</TableCell>
                <TableCell>
                  {renderRiskLevelBadge(risk.overallRiskAssessment.overallRiskLevel)}
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => setSelectedRisk(risk)}
                    variant="outlined"
                  >
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={!!selectedRisk} 
        onClose={() => setSelectedRisk(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du Risque de Transaction</DialogTitle>
        <DialogContent>
          {selectedRisk && (
            <Box>
              <Typography>
                Utilisateur : {selectedRisk.user.fullName}
              </Typography>
              <Typography>
                Niveau de Risque : 
                {renderRiskLevelBadge(selectedRisk.overallRiskAssessment.overallRiskLevel)}
              </Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Résultats de Vérification
              </Typography>
              {selectedRisk.verificationResults.map((result, index) => (
                <Card key={index} sx={{ mb: 1 }}>
                  <CardContent>
                    <Typography>
                      Service : {result.service}
                    </Typography>
                    <Typography>
                      Statut : {result.status}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            color="primary" 
            onClick={() => handleRiskReview('APPROVED')}
          >
            Approuver
          </Button>
          <Button 
            color="secondary" 
            onClick={() => handleRiskReview('BLOCKED')}
          >
            Bloquer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
