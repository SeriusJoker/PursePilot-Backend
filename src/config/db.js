const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not defined in environment variables.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

        // Handle disconnections and attempt reconnection
        mongoose.connection.on('disconnected', () => {
            console.error("⚠️ MongoDB Disconnected! Retrying in 5 seconds...");
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

        return conn; // ✅ Return the connection
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
