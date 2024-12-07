// server/index.js
const express = require('express');
const { createServer } = require('node:http');
const { resolve, join } = require('node:path');
const userController = require('./controllers/users');
const mealController = require('./controllers/meals');
const exerciseController = require('./controllers/exercise');
const verifyJWT = require('./middleware/verifyJWT');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());
app.use(express.static(resolve('dist')));

// Controllers
app.get("/", (req, res, next) => {
  res.send("Hello World");
})
  .use(verifyJWT)
  .use("/api/v1/users", userController)
  .use("/api/v1/meals", mealController)
  .use("/api/v1/exercises", exerciseController)
  .get("*", (req, res, next) => {
    res.sendFile(join(resolve('dist'), 'index.html'));
  });

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).send(err);
});

// Create HTTP server with Express app
const server = createServer(app);

// Start the server
server.listen(PORT, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
