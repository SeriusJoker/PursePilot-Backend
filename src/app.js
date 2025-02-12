require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const cron = require('node-cron');
const processRecurringTransactions = require('./processRecurringTransactions');

const app = express();

(async () => {
    await connectDB(); // ✅ Ensure MongoDB connects before anything else

    // Middleware
    app.use(express.json());

    app.use(cors({
        origin: ['http://localhost:3000', 'https://pursepilot-frontend.onrender.com'],
        credentials: true,
    }));
    app.use(morgan('dev'));

    // ✅ Configure session storage AFTER MongoDB connects
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // API Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/transactions', require('./routes/transactionRoutes'));

    // Test Route
    app.get('/', (req, res) => {
        res.send('🚀 API is running...');
    });

    // Recurring transaction job
    cron.schedule('0 0 * * *', () => {
        console.log("⏳ Running scheduled job for recurring transactions...");
        processRecurringTransactions();
    });

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

})();
