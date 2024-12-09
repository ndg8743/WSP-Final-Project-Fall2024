const model = require("../models/users");
const express = require("express");
const app = express.Router();

app
  .get("/", async (req, res, next) => {
    try {
      const users = await model.getAll();
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const users = await model.get(id);
      if (!users.data) {
        return res
          .status(404)
          .send({ isSuccess: false, message: "Users not found" });
      }
      // Normalize user data (default image, friends list, etc.)
      users.data.image = users.data.image || "/assets/User.jpg";
      users.data.friends = users.data.friends || [];
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .post("/", async (req, res, next) => {
    try {
      const users = await model.add(req.body);
      res.status(201).send(users);
    } catch (error) {
      next(error);
    }
  })

  .post("/login", async (req, res) => {
    console.log("Received POST request for /api/v1/users/login");
    try {
      const { identifier, password } = req.body;
      console.log("Login attempt with identifier:", identifier);

      const response = await model.login(identifier, password);
      console.log("Login result:", response);

      if (response.isSuccess) {
        res.status(200).json(response);
      } else {
        res.status(401).json(response);
      }
    } catch (error) {
      console.error("Error during login process:", error);
      res.status(500).json({ message: "Server error during login." });
    }
  })

  .patch("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const users = await model.update(+id, req.body);
      if (!users.data) {
        return res
          .status(404)
          .send({ isSuccess: false, message: "Users not found" });
      }
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })

  .delete("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const response = await model.remove(+id);
      if (!response.data) {
        return res
          .status(404)
          .send({ isSuccess: false, message: "Users not found" });
      }
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
