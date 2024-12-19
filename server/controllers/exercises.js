const express = require("express");
const { ExerciseError, ...model } = require("../models/exercises");
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
  if (error instanceof ExerciseError) {
    return res.status(error.code).json({
      isSuccess: false,
      message: error.message,
      data: []
    });
  }
  throw error; // Let Express error handler deal with other types of errors
};

app
  // Tag a friend in an exercise
  .post("/:id/tag/:friendId", requireUser, async (req, res, next) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const friendId = parseInt(req.params.friendId);

      if (isNaN(exerciseId) || isNaN(friendId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: [],
        });
      }

      // Get current exercise
      const { data: exercise, error: getError } = await model.conn
        .from("Exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (getError) throw getError;
      if (!exercise) {
        return res.status(404).json({
          isSuccess: false,
          message: "Exercise not found",
          data: [],
        });
      }

      // Update tagged friends
      const taggedFriends = Array.isArray(exercise.taggedFriends)
        ? [...new Set([...exercise.taggedFriends, friendId])]
        : [friendId];

      const { data, error } = await model.conn
        .from("Exercises")
        .update({ taggedFriends })
        .eq("id", exerciseId)
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

  // Untag a friend from an exercise
  .delete("/:id/tag/:friendId", requireUser, async (req, res, next) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const friendId = parseInt(req.params.friendId);

      if (isNaN(exerciseId) || isNaN(friendId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid ID format",
          data: [],
        });
      }

      // Get current exercise
      const { data: exercise, error: getError } = await model.conn
        .from("Exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (getError) throw getError;
      if (!exercise) {
        return res.status(404).json({
          isSuccess: false,
          message: "Exercise not found",
          data: [],
        });
      }

      // Update tagged friends
      const taggedFriends = Array.isArray(exercise.taggedFriends)
        ? exercise.taggedFriends.filter((id) => id !== friendId)
        : [];

      const { data, error } = await model.conn
        .from("Exercises")
        .update({ taggedFriends })
        .eq("id", exerciseId)
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

  // Search exercises by name
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

      // Get most recently used exercises matching the query
      const { data, error } = await model.conn
        .from("Exercises")
        .select("id, name, duration, caloriesBurned")
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Get unique exercises by name (keeping most recent)
      const uniqueExercises = data.reduce((acc, curr) => {
        if (
          !acc.some((ex) => ex.name.toLowerCase() === curr.name.toLowerCase())
        ) {
          acc.push(curr);
        }
        return acc;
      }, []);

      res.json({
        isSuccess: true,
        data: uniqueExercises || [],
        message: null,
      });
    } catch (error) {
      next(error);
    }
  })

  // Get all exercises (Admin only)
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

  // Get exercises by user ID or specific exercise by ID
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

      // Try to get exercises for a user ID first
      const response = await model.getByUserId(id);
      if (response.isSuccess && Array.isArray(response.data)) {
        return res.status(200).json(response);
      }

      // If not found as user exercises, try to get as a specific exercise
      const exerciseResponse = await model.get(id);
      if (exerciseResponse.data) {
        return res.status(200).json({
          ...exerciseResponse,
          data: ensureArray(exerciseResponse.data),
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "No exercises found",
        data: [],
      });
    } catch (error) {
      if (error instanceof ExerciseError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Create new exercise
  .post("/", requireUser, async (req, res, next) => {
    try {
      const { name } = req.body;

      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          isSuccess: false,
          message: "Exercise name is required",
          data: [],
        });
      }

      const newExercise = {
        ...req.body,
        userId: req.user.userid, // Enforce the user ID for the authenticated user
        duration: req.body.duration || 0,
        caloriesBurned: req.body.caloriesBurned || 0,
        date: req.body.date || new Date().toISOString().split("T")[0],
      };

      const response = await model.add(newExercise);
      res.status(response.isSuccess ? 201 : 400).json({
        ...response,
        data: ensureArray(response.data),
      });
    } catch (error) {
      if (error instanceof ExerciseError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Update exercise
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
          message: "Exercise name cannot be empty",
          data: [],
        });
      }

      const response = await model.updateExerciseForUser(
        id,
        req.body,
        req.user.userid
      );
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data),
      });
    } catch (error) {
      if (error instanceof ExerciseError) {
        return handleError(error, res);
      }
      next(error);
    }
  })

  // Delete exercise
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

      const response = await model.deleteExerciseForUser(id, req.user.userid);
      res.status(response.isSuccess ? 200 : response.errorCode || 403).json({
        ...response,
        data: ensureArray(response.data),
      });
    } catch (error) {
      if (error instanceof ExerciseError) {
        return handleError(error, res);
      }
      next(error);
    }
  });
module.exports = app;
