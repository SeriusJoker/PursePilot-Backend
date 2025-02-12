const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not defined in environment variables.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

        // Handle disconnections and attempt reconnection with a delay
        mongoose.connection.on('disconnected', async () => {
            console.error("⚠️ MongoDB Disconnected! Retrying in 5 seconds...");
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

        return mongoose.connection; // ✅ Return the connection for session storage

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Stop the server if connection fails
    }
};

module.exports = connectDB;
