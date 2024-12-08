const model = require("../models/user");
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
      const user = await model.get(id);
      if (!user.data) {
        return res
          .status(404)
          .send({ isSuccess: false, message: "User not found" });
      }
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  })

  .post("/", async (req, res, next) => {
    try {
      const user = await model.add(req.body);
      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  })

  .post("/login", async (req, res, next) => {
    try {
      const { name, password } = req.body; // Accept `name` instead of `email`
      if (!name || !password) {
        return res.status(400).json({
          isSuccess: false,
          message: "Username/email and password are required",
        });
      }

      const response = await model.login(name, password);
      if (response.isSuccess) {
        res.status(200).json(response);
      } else {
        res.status(401).json({ isSuccess: false, message: response.message });
      }
    } catch (error) {
      console.error("Error during login:", error);
      next(error);
    }
  })
  
  .patch("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await model.update(+id, req.body);
      if (!user.data) {
        return res
          .status(404)
          .send({ isSuccess: false, message: "User not found" });
      }
      res.status(200).send(user);
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
          .send({ isSuccess: false, message: "User not found" });
      }
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
