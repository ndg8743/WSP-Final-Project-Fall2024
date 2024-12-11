require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const path = require("path");
const cors = require("cors");

// Import controllers and middleware
const exerciseController = require(
  path.join(__dirname, "controllers", "exercises.js")
);
const mealsController = require(
  path.join(__dirname, "controllers", "meals.js")
);
const userController = require(path.join(__dirname, "controllers", "users.js"));
const { parseToken } = require(
  path.join(__dirname, "middleware", "verifyJWT.js")
);

console.log("Environment variables loaded:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SECRET_KEY:", process.env.SUPABASE_SECRET_KEY);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;
const VITE_API_URL = "/api/v1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(parseToken); // Apply parseToken globally

// Debugging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// API Routes
app.use(`${VITE_API_URL}/exercises`, exerciseController);
app.use(`${VITE_API_URL}/meals`, mealsController);
app.use(`${VITE_API_URL}/users`, userController);

// Serve static files for SPA
app.use(express.static(path.resolve(__dirname, "dist")));

// SPA route handling - must come after static file serving
app.get("*", (req, res) => {
  console.log("Serving SPA");
  try {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  } catch (err) {
    console.error("Error serving SPA:", err);
    res.status(500).send("Error serving SPA");
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    code: err.code,
    syscall: err.syscall,
    path: err.path,
  });
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
