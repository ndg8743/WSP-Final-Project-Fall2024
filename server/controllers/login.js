const express = require('express');
const model = require('../model/user');
const app = express.Router();

app.post("/", (req, res, next) => {
    const { email, password } = req.body;
    model.getAll()
        .then(users => {
            const user = users.data.find(u => u.email === email && u.password === password);
            if (user) {
                res.send({ isSuccess: true, data: user });
            } else {
                res.status(401).send({ isSuccess: false, message: "Invalid credentials" });
            }
        })
        .catch(next);
});

module.exports = app;
