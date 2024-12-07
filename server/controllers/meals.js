const express = require('express');
const model = require('../model/meals');
const verifyJWT = require('../middleware/verifyJWT');
const app = express.Router();

app.get("/", verifyJWT, (req, res, next) => {
    model.getAll()
        .then((x) => res.send(x))
        .catch(next);
})
.get("/:id", verifyJWT, (req, res, next) => {
    const id = req.params.id;
    model.get(+id)
        .then((x) => res.send(x))
        .catch(next);
})
.post("/", verifyJWT, (req, res, next) => {
    model.add(req.body)
        .then((x) => res.send(x))
        .catch(next);
})
.patch("/:id", verifyJWT, (req, res, next) => {
    const id = req.params.id;
    model.update(+id, req.body)
        .then((x) => res.send(x))
        .catch(next);
})
.delete("/:id", verifyJWT, (req, res, next) => {
    const id = req.params.id;
    model.remove(+id)
        .then((x) => res.send(x))
        .catch(next);
});

module.exports = app;
