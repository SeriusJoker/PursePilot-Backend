const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI // e.g. https://pursepilot-backend.onrender.com/api/auth/google/callback
}, 
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }

        // You can generate a token here, but we also do it in authRoutes.js. 
        // If you want to store it here, return it in the final argument:
        // e.g. done(null, { user, token: '...' });

        // For this example, just return user object
        return done(null, { user });
    } catch (err) {
        return done(err, null);
    }
}));

// We do NOT use serializeUser/deserializeUser since we're not using sessions
module.exports = passport;
