const express = require("express");
const app = express.Router();
const {
  getAll,
  get,
  login,
  add,
  update,
  remove,
  addFriend,
  removeFriend,
  createToken,
  searchUsers
} = require("../models/users");
const {
  requireUser,
  requireAdmin,
  parseToken,
} = require("../middleware/verifyJWT");

// Apply parseToken middleware globally to all routes
app.use(parseToken);

app
  // Search users
  .get("/search", requireUser, async (req, res, next) => {
    try {
      const query = req.query.q;
      const limit = parseInt(req.query.limit) || 5;
      const response = await searchUsers(query, limit);
      res.status(response.isSuccess ? 200 : 400).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Get all users (Admin only)
  .get("/", async (req, res, next) => {
    try {
      const response = await getAll();
      res.status(response.isSuccess ? 200 : 404).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Get user by ID (Authenticated user, Admin, or Friend)
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!req.user) {
        return res.status(401).json({ 
          isSuccess: false, 
          message: "Authentication required" 
        });
      }

      const userResponse = await get(req.user.userid);
      if (!userResponse.isSuccess) {
        return res.status(404).json({ isSuccess: false, message: "Requesting user not found." });
      }

      const response = await get(id);
      
      if (response.isSuccess) {
        if (req.user.userid === id || 
            req.user.role === "admin" || 
            (userResponse.data.friends && userResponse.data.friends.includes(id))) {
          return res.status(200).json(response);
        }
        return res.status(403).json({ isSuccess: false, message: "Access denied." });
      }
      
      res.status(404).json({ isSuccess: false, message: "User not found." });
    } catch (error) {
      next(error);
    }
  })

  // User login
  .post("/login", async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      const response = await login(identifier, password);
      res.status(response.isSuccess ? 200 : 401).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Add a new user
  .post("/", async (req, res, next) => {
    try {
      const response = await add(req.body);
      res.status(response.isSuccess ? 201 : 400).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Update user details (Authenticated user or Admin)
  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (req.user.userid === id || req.user.role === "admin") {
        const response = await update(id, req.body);
        return res.status(response.isSuccess ? 200 : 404).json(response);
      }
      res.status(403).json({ isSuccess: false, message: "Access denied." });
    } catch (error) {
      next(error);
    }
  })

  // Delete user (Admin only)
  .delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const response = await remove(id);
      res.status(response.isSuccess ? 200 : 404).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Add a friend
  .post("/:userId/friends/:friendId", requireUser, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendId = parseInt(req.params.friendId);
      const response = await addFriend(userId, friendId);
      res.status(response.isSuccess ? 200 : response.errorCode).json(response);
    } catch (error) {
      next(error);
    }
  })

  // Remove a friend
  .delete("/:userId/friends/:friendId", requireUser, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendId = parseInt(req.params.friendId);
      const response = await removeFriend(userId, friendId);
      res.status(response.isSuccess ? 200 : response.errorCode).json(response);
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
