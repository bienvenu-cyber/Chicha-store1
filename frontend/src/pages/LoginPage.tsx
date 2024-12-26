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
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
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
          Connexion
        </Typography>
        <form onSubmit={handleLogin} style={{ width: '100%', marginTop: 1 }}>
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
            Se connecter
          </Button>
          <Typography variant="body2" align="center">
            Pas de compte ? 
            <MuiLink component={Link} to="/register" sx={{ ml: 1 }}>
              Inscrivez-vous
            </MuiLink>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
