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
        console.log(`✅ Google Login Success: User - ${req.user ? req.user.email : "No user"}`);
        
        // 🔍 Debug session immediately after login
        console.log("📌 Session After Login:", req.session);
        console.log("📌 User After Login:", req.user);

        // Ensure session is saved before redirecting
        req.session.save(err => {
            if (err) {
                console.error("❌ Error saving session:", err);
            }
            res.redirect(`${FRONTEND_URL}/dashboard`);
        });
    }
);

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error("❌ Logout Error:", err);
            return res.status(500).send({ error: "Logout failed" });
        }

        req.session.destroy(() => { // ✅ Destroy session to fully log out
            res.clearCookie('connect.sid'); // ✅ Clear session cookie
            res.send({ message: "Logged out successfully" });
        });
    });
});

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
router.get('/check', (req, res) => {
    console.log("🔍 Checking Authentication Status...");
    console.log("📌 Session Data:", req.session);
    console.log("📌 User Data:", req.user);

    if (req.isAuthenticated()) {
        res.status(200).json({ user: req.user });
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
});

module.exports = router;
