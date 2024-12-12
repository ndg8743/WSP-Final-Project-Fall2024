const model = require("../models/users");
const { addFriend } = require("../models/users");
const {
  requireUser,
  requireAdmin,
  parseToken,
} = require("../middleware/verifyJWT");
const express = require("express");
const app = express.Router();

// Apply parseToken middleware globally to all routes
app.use(parseToken);

app
  // Get all users (Admin only)
  .get("/", async (req, res, next) => {
    try {
      const users = await model.getAll();

      if (!users || users.data.length === 0) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "No users found." });
      }

      res
        .status(200)
        .json({ isSuccess: true, data: users.data, total: users.total });
    } catch (error) {
      next(error);
    }
  })

  // Get user by ID (Authenticated user or Admin)
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const user = await model.get(id);

      if (!user || !user.data) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found." });
      }

      // Ensure only the requested user or admin can access the data
      if (req.user.userid !== id && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ isSuccess: false, message: "Access denied." });
      }

      res.status(200).json({ isSuccess: true, data: user.data });
    } catch (error) {
      next(error);
    }
  })

  // User login
  .post("/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;

      // Validate input
      if (!identifier || !password) {
        return res.status(400).json({
          isSuccess: false,
          message: "Identifier and password are required.",
        });
      }

      const response = await model.login(identifier, password);

      if (response.isSuccess) {
        return res.status(200).json(response);
      }

      return res
        .status(401)
        .json({ isSuccess: false, message: response.message });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ isSuccess: false, message: "Server error during login." });
    }
  })

  // Update user details (Authenticated user or Admin)
  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      // Ensure the user can only update their own details or admin access
      if (req.user.userid !== id && req.user.role !== "admin") {
        return res.status(403).json({
          isSuccess: false,
          message: "You are not authorized to update this user.",
        });
      }

      const updatedUser = await model.update(id, req.body);

      if (!updatedUser || !updatedUser.data) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found." });
      }

      res.status(200).json({ isSuccess: true, data: updatedUser.data });
    } catch (error) {
      next(error);
    }
  })

  // Delete user (Admin only)
  .delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      const response = await model.remove(id);

      if (!response || !response.data) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found." });
      }

      res.status(200).json({
        isSuccess: true,
        message: "User deleted successfully.",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  })

  // Add a new user
  .post("/", async (req, res, next) => {
    try {
      console.log("Request Body:", req.body); // Debugging
      const response = await model.add(req.body);
      if (response.isSuccess) {
        res.status(201).json(response);
      } else {
        console.error("Validation Error:", response.message);
        res.status(400).json({ isSuccess: false, message: response.message });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Server error during user creation.",
      });
    }
  })
  // Add a friend
  .post("/:userId/friends/:friendId", requireUser, async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    const friendId = parseInt(req.params.friendId);

    console.log("Processing add friend:", { userId, friendId });

    const result = await addFriend(userId, friendId);

    if (!result.success) {
      return res
        .status(parseInt(result.errorCode))
        .json({ isSuccess: false, message: result.message });
    } else {
      res.status(200).json({ isSuccess: true, message: result.message });
    }
  })

  // Remove a friend
  .delete("/:userId/friends/:friendId", requireUser, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendId = parseInt(req.params.friendId);

      if (isNaN(userId) || isNaN(friendId)) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Invalid userId or friendId." });
      }

      // Fetch the user and their friends array
      const user = await model.get(userId);
      if (!user.isSuccess || !user.data) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found." });
      }

      const updatedFriends = user.data.friends.filter((id) => id !== friendId); // Remove the friend

      // Update the user
      const response = await model.update(userId, {
        ...user.data,
        friends: updatedFriends,
      });
      if (!response.isSuccess) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Failed to remove friend." });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Friend removed successfully.",
        data: response.data,
      });
    } catch (error) {
      console.error("Error in removeFriend route:", error);
      next(error);
    }
  });

module.exports = app;
