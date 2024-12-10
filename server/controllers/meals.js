const express = require("express");
const model = require("../models/meals");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app
  .get("/", requireUser, async (req, res, next) => {
    try {
      const requestingUser = req.user;
      const { data, error } = await model.getAll();
      if (error) {
        return res.status(500).json({ isSuccess: false, message: error.message });
      }
      const userMeals = data.filter(
        (meals) =>
          meals.userId === requestingUser.id ||
          (requestingUser.friends || []).includes(meals.userId)
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
  })
  .get("/all", async (req, res, next) => {
    try {
      const meals = await model.getAll();
      meals.data = meals.data.map((meal) => ({
        id: meal.id,
        name: meal.name,
        mealCalories: meal.mealCalories,
        date: meal.date,
        userId: meal.userId,
      }));
      res.status(200).send(meals);
    } catch (error) {
      next(error);
    }
  })
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const meals = await model.get(+req.params.id);
      const requestingUser = req.user;
      if (
        !meals.data ||
        (meals.data.userId !== requestingUser.id &&
          !(requestingUser.friends || []).includes(meals.data.userId))
      ) {
        return res
          .status(403)
          .json({ error: "You are not authorized to view this meal." });
      }
      res.status(200).json(meals);
    } catch (error) {
      next(error);
    }
  })
  .post("/", requireUser, async (req, res, next) => {
    try {
      const newMeal = req.body;
      if (newMeal.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You can only add meals for yourself." });
      }
      const addedMeal = await model.add(newMeal);
      res.status(201).json(addedMeal);
    } catch (error) {
      next(error);
    }
  })
  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const meals = await model.get(+req.params.id);
      if (!meals.data || meals.data.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You can only update your own meals." });
      }
      const updatedMeal = await model.update(+req.params.id, req.body);
      res.status(200).json(updatedMeal);
    } catch (error) {
      next(error);
    }
  })
  .delete("/:id", requireUser, async (req, res, next) => {
    try {
      const meals = await model.get(+req.params.id);
      if (!meals.data || meals.data.userId !== req.user.id) {
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
