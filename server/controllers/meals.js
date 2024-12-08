const express = require("express");
const model = require("../models/meals");
const { requireUser, requireAdmin } = require("../middleware/verifyJWT");
const app = express.Router();

app.get("/", requireUser, async (req, res, next) => {
  try {
    const meals = await model.getAll();
    res.status(200).json(meals);
  } catch (error) {
    next(error);
  }
});

app.get("/:id", requireUser, async (req, res, next) => {
  try {
    const meal = await model.get(+req.params.id);
    res.status(200).json(meal);
  } catch (error) {
    next(error);
  }
});

app.post("/", requireAdmin, async (req, res, next) => {
  try {
    const newMeal = await model.add(req.body);
    res.status(201).json(newMeal);
  } catch (error) {
    next(error);
  }
});

app.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const updatedMeal = await model.update(+req.params.id, req.body);
    res.status(200).json(updatedMeal);
  } catch (error) {
    next(error);
  }
});

app.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const deletedMeal = await model.remove(+req.params.id);
    res.status(200).json(deletedMeal);
  } catch (error) {
    next(error);
  }
});

module.exports = app;
