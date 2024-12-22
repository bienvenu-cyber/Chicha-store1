import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link as MuiLink 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ 
        padding: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        marginTop: 8 
      }}>
        <Typography component="h1" variant="h5">
          Inscription
        </Typography>
        <form onSubmit={handleRegister} style={{ width: '100%', marginTop: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            S'inscrire
          </Button>
          <Typography variant="body2" align="center">
            Déjà un compte ? 
            <MuiLink component={Link} to="/login" sx={{ ml: 1 }}>
              Connectez-vous
            </MuiLink>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
