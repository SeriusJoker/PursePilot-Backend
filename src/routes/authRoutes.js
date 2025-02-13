const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Change this to a secure secret

// @route   GET /api/auth/google
// @desc    Start Google OAuth Login
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Handle Google login callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        console.log(`✅ Google Login Success: User - ${req.user.email}`);

        // Generate JWT Token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Send the token as a response
        res.json({ token });
    }
);

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
    res.json({ message: "Logged out successfully" });
});

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
router.get('/check', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
