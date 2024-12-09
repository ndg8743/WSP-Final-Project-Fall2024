const model = require("../models/users");
const { requireUser, requireAdmin, parseToken } = require("../middleware/verifyJWT");
const express = require("express");
const app = express.Router();

// Use the parseToken middleware for all routes
app.use(parseToken);

app
  .get("/", requireAdmin, async (req, res, next) => {
    try {
      const users = await model.getAll();
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = req.params.id;
      const users = await model.get(id);

      if (!users.data) {
        return res.status(404).json({ isSuccess: false, message: "User not found" });
      }

      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .post("/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;

      const response = await model.login(identifier, password);

      if (response.isSuccess) {
        res.status(200).json(response);
      } else {
        res.status(401).json(response);
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login." });
    }
  })

  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const id = req.params.id;

      if (req.user.userid !== parseInt(id) && req.user.role !== "admin") {
        return res.status(403).json({ error: "You are not authorized to update this user." });
      }

      const users = await model.update(id, req.body);

      if (!users.data) {
        return res.status(404).json({ isSuccess: false, message: "User not found" });
      }

      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await model.remove(id);

      if (!response.data) {
        return res.status(404).json({ isSuccess: false, message: "User not found" });
      }

      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
