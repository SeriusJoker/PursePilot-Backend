require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo'); // ✅ Import connect-mongo
const connectDB = require('./config/db'); // ✅ Ensure MongoDB connects first
const cron = require('node-cron');
const processRecurringTransactions = require('./processRecurringTransactions');

const app = express();

(async () => {
    try {
        const mongooseConnection = await connectDB(); // ✅ Wait for MongoDB before proceeding

        // Middleware
        app.use(express.json());

        // ✅ Updated CORS Configuration
        app.use(cors({
            origin: ['http://localhost:3000', 'https://pursepilot-frontend.onrender.com'], // ✅ Allow both local & deployed frontend
            credentials: true, // ✅ Allow cookies/session sharing
        }));
        app.use(morgan('dev'));

        // ✅ Configure session storage in MongoDB
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({ 
                client: mongooseConnection.connection.getClient(), // ✅ Use the MongoDB client directly
                collectionName: 'sessions',
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24, // ✅ 1-day session lifespan
                secure: process.env.NODE_ENV === 'production', // ✅ Secure cookies in production
                httpOnly: true,
            }
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

    } catch (error) {
        console.error(`❌ Error starting the server: ${error.message}`);
        process.exit(1);
    }
})();
