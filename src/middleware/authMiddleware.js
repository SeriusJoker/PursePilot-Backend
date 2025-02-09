module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "❌ Not authorized. Please log in." });
    }
    next();
};
