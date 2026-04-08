import './config'; // Load and validate env vars first

import express, { Express } from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/database';
import { seedDatabaseIfEmpty } from './db/seed';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import favoriteRoutes from './routes/favorites';
import articleRoutes from './routes/articles';
import aiRoutes from './routes/ai';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and seed if empty
initializeDatabase();
seedDatabaseIfEmpty();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
