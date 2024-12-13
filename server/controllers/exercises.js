const express = require("express");
const model = require("../models/exercises");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app
  .get("/", requireUser, async (req, res, next) => {
    try {
      const { userId } = req.query;
      const requestingUser = req.user;

      const response = userId
        ? await model.getUserAndFriendsExercises(+userId, requestingUser)
        : await model.getUserAndFriendsExercises(
            requestingUser.id,
            requestingUser
          );

      if (!response.isSuccess) {
        return res
          .status(404)
          .json({ isSuccess: false, message: response.message });
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  })

  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const response = await model.getAll();
      res.status(response.isSuccess ? 200 : 500).json(response);
    } catch (error) {
      next(error);
    }
  })

  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const response = await model.getExerciseForUser(+req.params.id, req.user);
      res
        .status(response.isSuccess ? 200 : response.errorCode || 403)
        .json(response);
    } catch (error) {
      next(error);
    }
  })

  .post("/", requireUser, async (req, res, next) => {
    try {
      const newExercise = req.body;
      newExercise.userId = req.user.id; // Enforce user ownership
      const response = await model.add(newExercise);
      res.status(response.isSuccess ? 201 : 400).json(response);
    } catch (error) {
      next(error);
    }
  })

  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const response = await model.updateExerciseForUser(
        +req.params.id,
        req.body,
        req.user.id
      );
      res
        .status(response.isSuccess ? 200 : response.errorCode || 403)
        .json(response);
    } catch (error) {
      next(error);
    }
  })

  .delete("/:id", requireUser, async (req, res, next) => {
    try {
      const response = await model.deleteExerciseForUser(
        +req.params.id,
        req.user.id
      );
      res
        .status(response.isSuccess ? 200 : response.errorCode || 403)
        .json(response);
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
