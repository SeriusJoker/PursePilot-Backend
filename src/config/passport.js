const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

// ✅ Ensure Passport is initialized
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log("🔑 Google Profile Received:", profile);
        
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            console.log("🆕 Creating New User");
            user = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }
        
        return done(null, user);
    } catch (err) {
        console.error("❌ Error in Google Auth:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    console.log("🔐 Serializing User:", user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log("🔄 Deserializing User with ID:", id);
        const user = await User.findById(id);
        console.log("✅ User Found:", user);
        done(null, user);
    } catch (err) {
        console.error("❌ Error deserializing user:", err);
        done(err, null);
    }
});

module.exports = passport;
