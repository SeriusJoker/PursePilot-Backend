const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("🔍 Incoming Authorization Header:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn("❌ Not authorized. No token provided.");
        return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(' ')[1]; // Extract token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decoded successfully:", decoded); // Log the decoded token
        req.user = decoded; // Attach user data to request
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: "Token is invalid or expired." });
    }
};
