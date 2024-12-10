const express = require("express");
const model = require("../models/meals");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app
  .get("/", requireUser, async (req, res, next) => {
    try {
      const { userId } = req.query;

      if (userId) {
        // Fetch meals for a specific user
        const { data, isSuccess, message } = await model.getByUserId(+userId);

        if (!isSuccess) {
          return res
            .status(404)
            .json({ isSuccess, message: "No meals found for this user." });
        }

        return res.status(200).json({
          isSuccess: true,
          message: "Meals fetched successfully for user.",
          data,
          total: data.length,
        });
      }

      // Fetch meals for the requesting user and their friends
      const requestingUser = req.user;
      const { data, isSuccess, message } = await model.getAll();

      if (!isSuccess) {
        return res.status(500).json({ isSuccess, message });
      }

      const userMeals = data.filter(
        (meal) =>
          meal.userId === requestingUser.id ||
          (requestingUser.friends || []).includes(meal.userId)
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

  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const { data, isSuccess, message } = await model.getAll();

      if (!isSuccess) {
        return res.status(500).json({ isSuccess, message });
      }

      res.status(200).json({
        isSuccess: true,
        message: "All meals fetched successfully.",
        data,
        total: data.length,
      });
    } catch (error) {
      next(error);
    }
  })
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const { data, isSuccess, message } = await model.get(+req.params.id);

      if (!isSuccess) {
        return res.status(404).json({ isSuccess, message: "Meal not found." });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Meal fetched successfully.",
        data,
      });
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
