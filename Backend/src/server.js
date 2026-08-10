import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[Server] Frontline Triage AI Backend running on http://localhost:${config.port}`);
  });
}

startServer();
