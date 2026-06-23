import express from 'express';
import cors from 'cors';
import competitorsRoutes from './routes/competitors.routes.js';

const app = express();
app.use(cors());

// Routes
app.use('/api/competitors', competitorsRoutes);

const PORT = 3001;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Scraper backend running on http://127.0.0.1:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
