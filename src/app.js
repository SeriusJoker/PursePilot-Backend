require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
require('./config/passport'); // ✅ Load Passport before using it
const connectDB = require('./config/db');
const cron = require('node-cron');
const processRecurringTransactions = require('./processRecurringTransactions');

const app = express();

(async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await connectDB(); // ✅ Wait for MongoDB to connect

        // Middleware
        app.use(express.json());

        app.use(cors({
            origin: 'https://pursepilot-frontend.onrender.com', // ✅ Allow only frontend
            credentials: true, // ✅ Ensures frontend sends cookies/headers
            allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Allow token-based auth
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }));
        app.use(morgan('dev'));

        app.use(passport.initialize()); // ✅ Only initialize passport (No sessions!)

        // ✅ Debug authentication
        app.use((req, res, next) => {
            console.log("🔍 Authenticated User:", req.user);
            next();
        });

        // API Routes
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/transactions', require('./routes/transactionRoutes'));

        // Test Route
        app.get('/', (req, res) => {
            res.send('🚀 API is running...');
        });

        // ✅ Schedule recurring transaction job
        cron.schedule('0 0 * * *', () => {
            console.log("⏳ Running scheduled job for recurring transactions...");
            processRecurringTransactions();
        });

        // ✅ Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1); // Stop server if DB connection fails
    }
})();
