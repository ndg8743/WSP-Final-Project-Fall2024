const express = require("express");
const model = require("../models/exercises");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app
  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const response = await model.getAll();
      res.status(response.isSuccess ? 200 : 500).json({
        ...response,
        data: Array.isArray(response.data) ? response.data : []
      });
    } catch (error) {
      next(error);
    }
  })

  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = +req.params.id;
      let response;

      // Try to get exercises for a user ID first
      response = await model.getByUserId(id);
      if (response.isSuccess && Array.isArray(response.data)) {
        return res.status(200).json(response);
      }

      // If not found as user exercises, try to get as a specific exercise
      const exerciseResponse = await model.get(id);
      if (exerciseResponse.data) {
        return res.status(200).json({
          ...exerciseResponse,
          data: [exerciseResponse.data] // Wrap single exercise in array
        });
      }

      // If nothing found, return empty array
      return res.status(200).json({
        isSuccess: true,
        message: "No exercises found",
        data: []
      });
    } catch (error) {
      next(error);
    }
  })

  .post("/", requireUser, async (req, res, next) => {
    try {
      const newExercise = req.body;
      newExercise.userId = req.user.id; // Enforce user ownership
      const response = await model.add(newExercise);
      res.status(response.isSuccess ? 201 : 400).json({
        ...response,
        data: response.data ? [response.data] : [] // Ensure array response
      });
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
        .json({
          ...response,
          data: response.data ? [response.data] : [] // Ensure array response
        });
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
        .json({
          ...response,
          data: response.data ? [response.data] : [] // Ensure array response
        });
    } catch (error) {
      next(error);
    }
  });

module.exports = app;
