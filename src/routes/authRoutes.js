const express = require('express');
const passport = require('passport');

const router = express.Router();

// Load frontend URL from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

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
        res.redirect(`${FRONTEND_URL}/dashboard`); // Redirect user to frontend
    }
);

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.send({ message: "Logged out successfully" });
    });
});

module.exports = router;
