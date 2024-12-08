const express = require("express");
const model = require("../models/meals");
const { requireUser } = require("../middleware/verifyJWT");
const app = express.Router();

// Get all meals (User can see their own meals and their friends' meals)
app.get("/", requireUser, async (req, res, next) => {
  try {
    const requestingUser = req.user;

    // Fetch all meals
    const { data, error, count } = await model.getAll();
    if (error) {
      return res.status(500).json({ isSuccess: false, message: error.message });
    }

    // Filter meals based on user and their friends
    const userMeals = data.filter(
      (meal) =>
        meal.user_id === requestingUser.id || // User's own meals
        (requestingUser.friends || []).includes(meal.user_id) // Friends' meals
    );

    res.status(200).json({
      isSuccess: true,
      message: "Meals fetched successfully.",
      data: userMeals,
      total: userMeals.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific meal by ID
app.get("/:id", requireUser, async (req, res, next) => {
  try {
    const meal = await model.get(+req.params.id);
    const requestingUser = req.user;

    // Check if the meal belongs to the user or their friends
    if (
      !meal.data ||
      (meal.data.user_id !== requestingUser.id &&
        !(requestingUser.friends || []).includes(meal.data.user_id))
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this meal." });
    }

    res.status(200).json(meal);
  } catch (error) {
    next(error);
  }
});

// Add a new meal (Only the user can add meals for themselves)
app.post("/", requireUser, async (req, res, next) => {
  try {
    const newMeal = req.body;

    // Ensure the meal is being added for the requesting user
    if (newMeal.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only add meals for yourself." });
    }

    const addedMeal = await model.add(newMeal);
    res.status(201).json(addedMeal);
  } catch (error) {
    next(error);
  }
});

// Update a meal by ID (Only the owner of the meal can update it)
app.patch("/:id", requireUser, async (req, res, next) => {
  try {
    const meal = await model.get(+req.params.id);

    // Ensure the meal belongs to the user
    if (!meal.data || meal.data.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own meals." });
    }

    const updatedMeal = await model.update(+req.params.id, req.body);
    res.status(200).json(updatedMeal);
  } catch (error) {
    next(error);
  }
});

// Delete a meal by ID (Only the owner of the meal can delete it)
app.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const meal = await model.get(+req.params.id);

    // Ensure the meal belongs to the user
    if (!meal.data || meal.data.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only delete your own meals." });
    }

    const deletedMeal = await model.remove(+req.params.id);
    res.status(200).json(deletedMeal);
  } catch (error) {
    next(error);
  }
});

module.exports = app;
