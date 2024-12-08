const express = require("express");
const model = require("../models/exercise");
const { requireUser } = require("../middleware/verifyJWT");
const app = express.Router();

// Get all exercises (Users can see their exercises and latest ones from friends)
app.get("/", requireUser, async (req, res, next) => {
  try {
    const requestingUser = req.user;

    // Fetch all exercises
    const { data, error } = await model.getAll();
    if (error) {
      return res.status(500).json({ isSuccess: false, message: error.message });
    }

    // Filter exercises for the user and their friends
    const userExercises = data.filter(
      (exercise) =>
        exercise.user_id === requestingUser.id || // User's own exercises
        (requestingUser.friends || []).includes(exercise.user_id) // Friends' exercises
    );

    // Sort by date to show latest exercises from friends
    const sortedExercises = userExercises.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      isSuccess: true,
      message: "Exercises fetched successfully.",
      data: sortedExercises,
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific exercise by ID (Users can only see their own or their friends' exercises)
app.get("/:id", requireUser, async (req, res, next) => {
  try {
    const exercise = await model.get(+req.params.id);
    const requestingUser = req.user;

    // Ensure user can only access their own or their friends' exercises
    if (
      !exercise.data ||
      (exercise.data.user_id !== requestingUser.id &&
        !(requestingUser.friends || []).includes(exercise.data.user_id))
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this exercise." });
    }

    res.status(200).json(exercise);
  } catch (error) {
    next(error);
  }
});

// Add a new exercise (Users can add their own exercises)
app.post("/", requireUser, async (req, res, next) => {
  try {
    const newExercise = req.body;

    // Ensure the exercise is being added for the requesting user
    if (newExercise.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only add exercises for yourself." });
    }

    const addedExercise = await model.add(newExercise);
    res.status(201).json(addedExercise);
  } catch (error) {
    next(error);
  }
});

// Update an exercise by ID (Users can only update their own exercises)
app.patch("/:id", requireUser, async (req, res, next) => {
  try {
    const exercise = await model.get(+req.params.id);

    // Ensure the exercise belongs to the user
    if (!exercise.data || exercise.data.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own exercises." });
    }

    const updatedExercise = await model.update(+req.params.id, req.body);
    res.status(200).json(updatedExercise);
  } catch (error) {
    next(error);
  }
});

// Delete an exercise by ID (Users can only delete their own exercises)
app.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const exercise = await model.get(+req.params.id);

    // Ensure the exercise belongs to the user
    if (!exercise.data || exercise.data.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only delete your own exercises." });
    }

    const deletedExercise = await model.remove(+req.params.id);
    res.status(200).json(deletedExercise);
  } catch (error) {
    next(error);
  }
});

module.exports = app;
