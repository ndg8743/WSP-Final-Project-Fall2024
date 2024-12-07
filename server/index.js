const express = require("express");
const { createServer } = require("http");
const path = require("path");
const cors = require("cors");
const exerciseController = require(path.join(__dirname, "controllers", "exercise.js"));
const mealsController = require(path.join(__dirname, "controllers", "meals.js"));
const userController = require(path.join(__dirname, "controllers", "users.js"));
const { parseToken } = require(path.join(__dirname, "middleware", "verifyJWT.js"));

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = "/api/v1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(parseToken); // Parse token and attach user to the request

// API Routes
app.use(`${API_PREFIX}/exercises`, exerciseController);
app.use(`${API_PREFIX}/meals`, mealsController);
app.use(`${API_PREFIX}/users`, userController);

// Serve static files for SPA
app.use(express.static(path.resolve("dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve("client/index.html"));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});