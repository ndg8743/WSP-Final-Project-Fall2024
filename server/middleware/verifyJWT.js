const jwt = require("jsonwebtoken");
/**
 * Parse and verify the token, and attach the user payload to the request object.
 */
async function parseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return next(); // Continue without a token
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload) {
      req.user = payload; // Attach user payload to request
    }
  } catch (error) {
    console.error("Error while parsing authorization token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  next();
}

/**
 * Middleware to require a logged-in user.
 */
function requireUser(req, res, next) {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ error: "Must be logged in to perform this action." });
  }
  next();
}

/**
 * Middleware to require admin access.
 */
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ error: "Must be logged in to perform this action." });
  }
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Must be an admin to perform this action." });
  }
  next();
}

module.exports = { parseToken, requireUser, requireAdmin };
