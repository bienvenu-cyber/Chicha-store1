import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";const app = express();
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Chicha Store',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

describe('Route Racine', () => {
  test('GET / doit renvoyer un statut 200', async () => {
    const response = await request(app).get('/');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Bienvenue sur l\'API Chicha Store');
    expect(response.body).toHaveProperty('status', 'running');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('Le timestamp doit être un format ISO valide', async () => {
    const response = await request(app).get('/');
    const timestamp = response.body.timestamp;
    
    expect(() => new Date(timestamp)).not.toThrow();
  });
});
