const { verifyToken } = require("../models/users");

/**
 * Middleware to parse and verify the token, attaching the user payload to the request object.
 */
async function parseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const payload = await verifyToken(token);
    req.user = payload; // Attach payload to the request
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  next();
}

/**
 * Middleware to require a logged-in user.
 */
function requireUser(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to perform this action." });
  }
  next();
}

/**
 * Middleware to require admin access.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You must be an admin to perform this action." });
  }
  next();
}

module.exports = { parseToken, requireUser, requireAdmin };
