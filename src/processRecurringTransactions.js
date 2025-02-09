const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config({ path: '../.env' }); // ✅ Explicitly set .env path
const connectDB = require('./config/db');

const processRecurringTransactions = async () => {
    console.log("🔄 Processing recurring transactions...");
    const today = new Date();

    try {
        const recurringTransactions = await Transaction.find({ frequency: { $ne: 'once' } });

        for (let txn of recurringTransactions) {
            const lastDate = new Date(txn.date);
            let nextDate = null;

            switch (txn.frequency) {
                case 'daily':
                    nextDate = new Date(lastDate.setDate(lastDate.getDate() + 1));
                    break;
                case 'weekly':
                    nextDate = new Date(lastDate.setDate(lastDate.getDate() + 7));
                    break;
                case 'monthly':
                    nextDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1));
                    break;
                case 'quarterly':
                    nextDate = new Date(lastDate.setMonth(lastDate.getMonth() + 3));
                    break;
                case 'yearly':
                    nextDate = new Date(lastDate.setFullYear(lastDate.getFullYear() + 1));
                    break;
                default:
                    continue;
            }

            if (nextDate <= today) {
                console.log(`✅ Creating new transaction for ${txn.category} (${txn.frequency})`);

                await Transaction.create({
                    userId: txn.userId,
                    amount: txn.amount,
                    type: txn.type,
                    category: txn.category,
                    date: nextDate,
                    description: txn.description,
                    frequency: txn.frequency,
                });

                // Update last transaction date
                txn.date = nextDate;
                await txn.save();
            }
        }

        console.log("✅ Recurring transactions processed.");
    } catch (error) {
        console.error("❌ Error processing recurring transactions:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Ensure the database connects before running the job
connectDB()
    .then(() => {
        console.log("✅ MongoDB connected. Running recurring transactions job...");
        processRecurringTransactions();
    })
    .catch((error) => {
        console.error("❌ MongoDB Connection Failed:", error);
    });
