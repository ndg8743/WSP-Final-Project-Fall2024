
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Forbidden' });
    }
};

module.exports = verifyJWT;