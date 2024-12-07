const express = require('express');
const model = require('../model/exercise');
const { requireUser, requireAdmin } = require('../middleware/verifyJWT');
const app = express.Router();

app.get("/", requireUser, async (req, res, next) => {
    try {
        const exercises = await model.getAll();
        res.status(200).json(exercises);
    } catch (error) {
        next(error);
    }
});

app.get("/:id", requireUser, async (req, res, next) => {
    try {
        const exercise = await model.get(+req.params.id);
        res.status(200).json(exercise);
    } catch (error) {
        next(error);
    }
});

app.post("/", requireUser, async (req, res, next) => {
    try {
        const newExercise = await model.add(req.body);
        res.status(201).json(newExercise);
    } catch (error) {
        next(error);
    }
});

app.patch("/:id", requireUser, async (req, res, next) => {
    try {
        const updatedExercise = await model.update(+req.params.id, req.body);
        res.status(200).json(updatedExercise);
    } catch (error) {
        next(error);
    }
});

app.delete("/:id", requireUser, async (req, res, next) => {
    try {
        const deletedExercise = await model.remove(+req.params.id);
        res.status(200).json(deletedExercise);
    } catch (error) {
        next(error);
    }
});

module.exports = app;
