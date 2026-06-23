import express from 'express';
import cors from 'cors';
import competitorsRoutes from './routes/competitors.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins in production, or specify your Vercel URL
app.use(cors({
  origin: '*' // In production, you might want to lock this down to your Vercel domain
}));

app.use(express.json());

// Routes
app.use('/api/competitors', competitorsRoutes);

const server = app.listen(PORT, () => {
  console.log(`Scraper backend running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
