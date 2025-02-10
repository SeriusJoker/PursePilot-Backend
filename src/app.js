require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // Load Passport configuration
const connectDB = require('./config/db');
const cron = require('node-cron');
const processRecurringTransactions = require('./processRecurringTransactions');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ Updated CORS Configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://pursepilot-frontend.onrender.com'], // ✅ Allow both local & deployed frontend
    credentials: true, // ✅ Allow cookies/session sharing
}));
app.use(morgan('dev'));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));  // ✅ Google Authentication Routes
app.use('/api/transactions', require('./routes/transactionRoutes'));  // ✅ Transactions API

// Test Route
app.get('/', (req, res) => {
    res.send('🚀 API is running...');
});

// ✅ Schedule recurring transaction job
cron.schedule('0 0 * * *', () => {
    console.log("⏳ Running scheduled job for recurring transactions...");
    processRecurringTransactions();
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
