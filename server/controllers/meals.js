const express = require("express");
const { MealError, ...model } = require("../models/meals");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

/**
 * Ensures response data is always an array
 * @param {*} data - Response data
 * @returns {Array} Data wrapped in array if not already an array
 */
const ensureArray = (data) => Array.isArray(data) ? data : (data ? [data] : []);

/**
 * Handles common error responses
 * @param {Error} error - Error object
 * @param {Response} res - Express response object
 */
const handleError = (error, res) => {
  if (error instanceof MealError) {
    return res.status(error.code).json({
      isSuccess: false,
      message: error.message,
      data: []
    });
  }
  throw error; // Let Express error handler deal with other types of errors
};

app
  // Get all meals (Admin only)
  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const response = await model.getAll();
      res.status(response.isSuccess ? 200 : 500).json({
        ...response,
        data: ensureArray(response.data)
      });
    } catch (error) {
      next(error);
    }
  })

  // Get meals by user ID or specific meal by ID
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: []
        });
      }

      // Try to get meals for a user ID first
      const response = await model.getByUserId(id);
      if (response.isSuccess && Array.isArray(response.data)) {
        return res.status(200).json(response);
      }

      // If not found as user meals, try to get as a specific meal
      const mealResponse = await model.get(id);
      if (mealResponse.data) {
        return res.status(200).json({
          ...mealResponse,
          data: ensureArray(mealResponse.data)
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "No meals found",
        data: []
      });
    } catch (error) {
      if (error instanceof MealError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Create new meal
  .post("/", requireUser, async (req, res, next) => {
    try {
      const { name } = req.body;
      
      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          isSuccess: false,
          message: "Meal name is required",
          data: []
        });
      }

      const newMeal = {
        ...req.body,
        userId: req.user.userid, // Enforce the user ID for the authenticated user
        mealCalories: req.body.mealCalories || 0,
        date: req.body.date || new Date().toISOString().split('T')[0]
      };

      const response = await model.add(newMeal);
      res.status(response.isSuccess ? 201 : 400).json({
        ...response,
        data: ensureArray(response.data)
      });
    } catch (error) {
      if (error instanceof MealError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Update meal
  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: []
        });
      }

      if (req.body.name && !req.body.name.trim()) {
        return res.status(400).json({
          isSuccess: false,
          message: "Meal name cannot be empty",
          data: []
        });
      }

      const response = await model.updateMealForUser(
        id,
        req.body,
        req.user.userid
      );
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data)
      });
    } catch (error) {
      if (error instanceof MealError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Delete meal
  .delete("/:id", requireUser, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: []
        });
      }

      const response = await model.deleteMealForUser(
        id,
        req.user.userid
      );
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data)
      });
    } catch (error) {
      if (error instanceof MealError) {
        return handleError(error, res);
      }
      next(error);
    }
  });

module.exports = app;
