const express = require("express");
const model = require("../models/exercises");
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
      const userExercises = data.filter(
        (exercises) =>
          exercises.user_id === requestingUser.id ||
          (requestingUser.friends || []).includes(exercises.user_id)
      );
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
  })
  .get("/all", requireAdmin, async (req, res, next) => {
    try {
      const exercises = await model.getAll();
      exercises.data = exercises.data.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        duration: exercise.duration,
        calories: exercise.calories,
        date: exercise.date,
        userId: exercise.user_id,
      }));
      res.status(200).send(exercises);
    } catch (error) {
      next(error);
    }
  })
  .get("/:id", requireUser, async (req, res, next) => {
    try {
      const exercises = await model.get(+req.params.id);
      const requestingUser = req.user;
      if (
        !exercises.data ||
        (exercises.data.user_id !== requestingUser.id &&
          !(requestingUser.friends || []).includes(exercises.data.user_id))
      ) {
        return res
          .status(403)
          .json({ error: "You are not authorized to view this exercise." });
      }
      res.status(200).json(exercises);
    } catch (error) {
      next(error);
    }
  })
  .post("/", requireUser, async (req, res, next) => {
    try {
      const newExercise = req.body;
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
  })
  .patch("/:id", requireUser, async (req, res, next) => {
    try {
      const exercises = await model.get(+req.params.id);
      if (!exercises.data || exercises.data.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You can only update your own exercises." });
      }
      const updatedExercise = await model.update(+req.params.id, req.body);
      res.status(200).json(updatedExercise);
    } catch (error) {
      next(error);
    }
  })
  .delete("/:id", requireUser, async (req, res, next) => {
    try {
      const exercises = await model.get(+req.params.id);
      if (!exercises.data || exercises.data.user_id !== req.user.id) {
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
