import express from 'express';
import cors from 'cors';
import triageRoutes from './routes/triageRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import evalRoutes from './routes/evalRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API route mounts
app.use('/api/triage', triageRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/eval', evalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Frontline Triage AI Engine',
    timestamp: new Date().toISOString(),
  });
});

export default app;
