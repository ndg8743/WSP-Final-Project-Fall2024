const express = require("express");
const model = require("../models/meals");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app
  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const response = await model.getAll();
      if (!response.isSuccess) {
        return res.status(500).json(response);
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  })

  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = +req.params.id;
      let response;

      // First try to get as a specific meal
      const mealResponse = await model.get(id);
      if (mealResponse.data) {
        return res.status(200).json(mealResponse);
      }

      // If not found as a specific meal, try to get meals for a user ID
      response = await model.getByUserId(id);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  })

  .post("/", requireUser, async (req, res, next) => {
    try {
      const newMeal = req.body;
      newMeal.userId = req.user.id; // Enforce the user ID for the authenticated user
      const response = await model.add(newMeal);
      res.status(response.isSuccess ? 201 : 400).json(response);
    } catch (error) {
      next(error);
    }
  })

  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const response = await model.updateMealForUser(
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
      const response = await model.deleteMealForUser(
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
