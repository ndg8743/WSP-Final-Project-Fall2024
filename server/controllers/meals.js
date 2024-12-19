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
  // Tag a friend in a meal
  .post("/:id/tag/:friendId", requireUser, async (req, res, next) => {
    try {
      const mealId = parseInt(req.params.id);
      const friendId = parseInt(req.params.friendId);

      if (isNaN(mealId) || isNaN(friendId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: [],
        });
      }

      // Get current meal
      const { data: meal, error: getError } = await model.conn
        .from("Meals")
        .select("*")
        .eq("id", mealId)
        .single();

      if (getError) throw getError;
      if (!meal) {
        return res.status(404).json({
          isSuccess: false,
          message: "Meal not found",
          data: [],
        });
      }

      // Update tagged friends
      const taggedFriends = Array.isArray(meal.taggedFriends)
        ? [...new Set([...meal.taggedFriends, friendId])]
        : [friendId];

      const { data, error } = await model.conn
        .from("Meals")
        .update({ taggedFriends })
        .eq("id", mealId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        isSuccess: true,
        data,
        message: null,
      });
    } catch (error) {
      next(error);
    }
  })

  // Untag a friend from a meal
  .delete("/:id/tag/:friendId", requireUser, async (req, res, next) => {
    try {
      const mealId = parseInt(req.params.id);
      const friendId = parseInt(req.params.friendId);

      if (isNaN(mealId) || isNaN(friendId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: [],
        });
      }

      // Get current meal
      const { data: meal, error: getError } = await model.conn
        .from("Meals")
        .select("*")
        .eq("id", mealId)
        .single();

      if (getError) throw getError;
      if (!meal) {
        return res.status(404).json({
          isSuccess: false,
          message: "Meal not found",
          data: [],
        });
      }

      // Update tagged friends
      const taggedFriends = Array.isArray(meal.taggedFriends)
        ? meal.taggedFriends.filter((id) => id !== friendId)
        : [];

      const { data, error } = await model.conn
        .from("Meals")
        .update({ taggedFriends })
        .eq("id", mealId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        isSuccess: true,
        data,
        message: null,
      });
    } catch (error) {
      next(error);
    }
  })

  // Search meals by name
  .get("/search", requireUser, async (req, res, next) => {
    try {
      const query = req.query.q;
      const limit = parseInt(req.query.limit) || 5;

      if (!query) {
        return res.json({
          isSuccess: true,
          data: [],
          message: null,
        });
      }

      // Get most recently used meals matching the query
      const { data, error } = await model.conn
        .from("Meals")
        .select("id, name, mealCalories")
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Get unique meals by name (keeping most recent)
      const uniqueMeals = data.reduce((acc, curr) => {
        if (
          !acc.some((meal) => meal.name.toLowerCase() === curr.name.toLowerCase())
        ) {
          acc.push(curr);
        }
        return acc;
      }, []);

      res.json({
        isSuccess: true,
        data: uniqueMeals || [],
        message: null,
      });
    } catch (error) {
      next(error);
    }
  })

  // Get all meals (Admin only)
  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const response = await model.getAll();
      res.status(response.isSuccess ? 200 : 500).json({
        ...response,
        data: ensureArray(response.data),
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
          data: [],
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
          data: ensureArray(mealResponse.data),
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "No meals found",
        data: [],
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
          data: [],
        });
      }

      const newMeal = {
        ...req.body,
        userId: req.user.userid, // Enforce the user ID for the authenticated user
        mealCalories: req.body.mealCalories || 0,
        date: req.body.date || new Date().toISOString().split("T")[0],
      };

      const response = await model.add(newMeal);
      res.status(response.isSuccess ? 201 : 400).json({
        ...response,
        data: ensureArray(response.data),
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
          data: [],
        });
      }

      if (req.body.name && !req.body.name.trim()) {
        return res.status(400).json({
          isSuccess: false,
          message: "Meal name cannot be empty",
          data: [],
        });
      }

      const response = await model.updateMealForUser(
        id,
        req.body,
        req.user.userid
      );
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data),
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
          data: [],
        });
      }

      const response = await model.deleteMealForUser(id, req.user.userid);
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data),
      });
    } catch (error) {
      if (error instanceof MealError) {
        return handleError(error, res);
      }
      next(error);
    }
  });

module.exports = app;
