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
const { parseToken } = require("./middleware/verifyJWT");

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const app = express();
const PORT = process.env.PORT || 3000;
const VITE_API_URL = "/api/v1";

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(parseToken); // Apply parseToken globally

/**
 * Production-ready request logger
 * Logs request method, path, and response time
 */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    };
    // Only log errors in production
    if (res.statusCode >= 400) {
      console.error(JSON.stringify(log));
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify(log));
    }
  });
  next();
});

// API Routes
app.use(`${VITE_API_URL}/exercises`, exerciseController);
app.use(`${VITE_API_URL}/meals`, mealsController);
app.use(`${VITE_API_URL}/users`, userController);

// Serve static files for SPA
app.use(express.static(path.resolve(__dirname, "dist")));

/**
 * SPA route handler - serves index.html for all unmatched routes
 * Must come after static file serving and API routes
 */
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

/**
 * Global error handler
 * Formats errors consistently and hides implementation details in production
 */
app.use((err, req, res, next) => {
  // Log error details for debugging
  const errorDetails = {
    message: err.message,
    code: err.code,
    path: err.path,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  };
  console.error('Server error:', JSON.stringify(errorDetails));

  // Send safe error response to client
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Server Error'
  });
});

// Start server
const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`Server running in ${mode} mode on http://localhost:${PORT}`);
});
