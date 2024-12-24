import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
