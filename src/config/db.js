const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not defined in .env file.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

        // Handle disconnections and attempt reconnection
        mongoose.connection.on('disconnected', () => {
            console.error("⚠️ MongoDB Disconnected! Retrying...");
            connectDB();
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Stop the server if connection fails
    }
};

module.exports = connectDB;
