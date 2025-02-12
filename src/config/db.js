const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set in environment variables.");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

        // Prevent unnecessary reconnections
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Error: ${err.message}`);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Stop the server if MongoDB fails
    }
};

module.exports = connectDB;
