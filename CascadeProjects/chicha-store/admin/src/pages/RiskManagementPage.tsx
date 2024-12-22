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
  DialogActions,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

interface RiskRule {
  _id: string;
  name: string;
  description: string;
  riskType: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  riskScore: number;
  action: string;
  isActive: boolean;
}

interface RiskTransaction {
  _id: string;
  user: {
    fullName: string;
    email: string;
  };
  transaction: {
    amount: number;
    currency: string;
  };
  riskAssessment: {
    riskLevel: string;
    riskScore: number;
  };
}

export const RiskManagementPage: React.FC = () => {
  const [customRules, setCustomRules] = useState<RiskRule[]>([]);
  const [riskTransactions, setRiskTransactions] = useState<RiskTransaction[]>([]);
  const [riskSummary, setRiskSummary] = useState<any[]>([]);
  const [selectedRule, setSelectedRule] = useState<RiskRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const [rulesResponse, dashboardResponse] = await Promise.all([
        axios.get('/api/risk-admin/custom-rules'),
        axios.get('/api/risk-admin/dashboard')
      ]);

      setCustomRules(rulesResponse.data.rules);
      setRiskTransactions(dashboardResponse.data.transactions);
      setRiskSummary(dashboardResponse.data.summary);
    } catch (error) {
      console.error('Erreur de récupération des données de risque', error);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await axios.post('/api/risk-admin/custom-rules', selectedRule);
      setCustomRules([...customRules, response.data.rule]);
      setIsRuleDialogOpen(false);
    } catch (error) {
      console.error('Erreur de création de règle', error);
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
      <Typography variant="h4">Gestion des Risques</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {riskSummary.map(summary => (
          <Grid item xs={3} key={summary._id}>
            <Card>
              <CardContent>
                <Typography>
                  Risque {summary._id}: {summary.count} transactions
                </Typography>
                <Typography>
                  Montant Total: {summary.totalAmount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Règles de Risque Personnalisées</Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setSelectedRule(null);
            setIsRuleDialogOpen(true);
          }}
        >
          Créer Règle
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type de Risque</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customRules.map(rule => (
              <TableRow key={rule._id}>
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.riskType}</TableCell>
                <TableCell>{rule.riskScore}</TableCell>
                <TableCell>{rule.action}</TableCell>
                <TableCell>
                  {rule.isActive ? 'Actif' : 'Inactif'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" sx={{ mt: 2 }}>
        Transactions à Risque
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Niveau de Risque</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riskTransactions.map(transaction => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.user.fullName}</TableCell>
                <TableCell>
                  {transaction.transaction.amount} {transaction.transaction.currency}
                </TableCell>
                <TableCell>
                  {renderRiskLevelBadge(transaction.riskAssessment.riskLevel)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={isRuleDialogOpen} 
        onClose={() => setIsRuleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRule ? 'Modifier Règle de Risque' : 'Créer Règle de Risque'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nom de la Règle"
            fullWidth
            sx={{ mb: 2 }}
            value={selectedRule?.name || ''}
            onChange={(e) => setSelectedRule({
              ...selectedRule,
              name: e.target.value
            } as RiskRule)}
          />

          <Select
            label="Type de Risque"
            fullWidth
            sx={{ mb: 2 }}
            value={selectedRule?.riskType || ''}
            onChange={(e) => setSelectedRule({
              ...selectedRule,
              riskType: e.target.value
            } as RiskRule)}
          >
            <MenuItem value="USER_HISTORY">Historique Utilisateur</MenuItem>
            <MenuItem value="DEVICE">Dispositif</MenuItem>
            <MenuItem value="GEOGRAPHIC">Géographique</MenuItem>
            <MenuItem value="TRANSACTION_PATTERN">Modèle de Transaction</MenuItem>
            <MenuItem value="EXTERNAL_SERVICE">Service Externe</MenuItem>
          </Select>

          {/* Champs dynamiques pour les conditions */}
          {/* À implémenter selon la complexité souhaitée */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRuleDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateRule}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
