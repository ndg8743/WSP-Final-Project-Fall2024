const express = require("express");
const model = require("../model/user");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

// Get all users (Admin only)
app.get("/", requireAdmin, async (req, res, next) => {
  try {
    const users = await model.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// Get all users (Available to all logged-in users)
app.get("/all", requireUser, async (req, res, next) => {
  try {
    const users = await model.getAll();
    // Optionally exclude sensitive fields like password from the response
    const sanitizedUsers = users.data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      friend_id: user.friend_id,
    }));
    res.status(200).json({
      isSuccess: true,
      data: sanitizedUsers,
    });
  } catch (error) {
    next(error);
  }
});

// Get a user by ID (Any logged-in user, restricted to their own profile unless admin)
app.get("/:id", requireUser, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const requestingUser = req.user;

    if (requestingUser.id !== userId && requestingUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only view your own profile." });
    }

    const user = await model.get(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// Add a new user (Public - Sign up functionality)
app.post("/", async (req, res, next) => {
  try {
    const newUser = await model.add(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Add a friend to a user's friend list
app.post("/:id/friends/:friendId", requireUser, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const friendId = +req.params.friendId;
    const requestingUser = req.user;

    if (requestingUser.id !== userId && requestingUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only add friends to your own profile." });
    }

    const updatedUser = await model.addFriend(userId, friendId);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Remove a friend from a user's friend list
app.delete("/:id/friends/:friendId", requireUser, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const friendId = +req.params.friendId;
    const requestingUser = req.user;

    if (requestingUser.id !== userId && requestingUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only remove friends from your own profile." });
    }

    const updatedUser = await model.removeFriend(userId, friendId);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Update a user (Self-edit or Admin edit)
app.patch("/:id", requireUser, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const requestingUser = req.user;

    if (requestingUser.id !== userId && requestingUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only edit your own profile." });
    }

    const updatedUser = await model.update(userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete a user (Admin only)
app.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const deletedUser = await model.remove(userId);
    res.status(200).json(deletedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = app;
