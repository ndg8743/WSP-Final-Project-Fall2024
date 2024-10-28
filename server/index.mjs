// server/index.mjs
import express from 'express';
import { createServer } from 'node:http';
import { resolve, join } from 'node:path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(resolve('dist')));

// Example API route (you can add more as needed)
app.get('/api/example', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(resolve('dist'), 'index.html'));
});

// Create HTTP server with Express app
const server = createServer(app);

// Start the server
//server.listen(PORT, '0.0.0.0', () => {
 // console.log(`Server is running on http://localhost:${PORT}`);
 // starts a simple http server locally on port 3000
server.listen(PORT, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
