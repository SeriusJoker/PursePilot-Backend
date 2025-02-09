const Transaction = require('../models/Transaction');

/**
 * @desc    Get transactions for the logged-in user.
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "❌ Not authenticated" });
        }

        console.log("🔍 Fetching transactions for user:", req.user._id);

        // Fetch transactions sorted by date (newest first)
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

        if (transactions.length === 0) {
            console.log("ℹ️ No transactions found for this user.");
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ message: "❌ Error fetching transactions", error: error.message });
    }
};

/**
 * @desc    Add a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const addTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, description, frequency } = req.body;

        if (!amount || !type || !category || !frequency) {
            return res.status(400).json({ message: "❌ Missing required fields." });
        }

        console.log("➕ Adding transaction for user:", req.user._id);

        // Assign the logged-in user's ID to the transaction
        const transaction = new Transaction({
            userId: req.user._id,
            amount,
            type,
            category,
            date,
            description,
            frequency,
        });

        await transaction.save();
        console.log("✅ Transaction added:", transaction);

        res.status(201).json(transaction);
    } catch (error) {
        console.error("❌ Error adding transaction:", error);
        res.status(500).json({ message: "❌ Error adding transaction", error: error.message });
    }
};

/**
 * @desc    Update an existing transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res) => {
    try {
        console.log(`✏️ Updating transaction ${req.params.id} for user: ${req.user._id}`);

        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "❌ Transaction not found" });
        }

        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "❌ Unauthorized to update this transaction" });
        }

        // Update transaction
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });

        console.log("✅ Transaction updated:", transaction);
        res.status(200).json(transaction);
    } catch (error) {
        console.error("❌ Error updating transaction:", error);
        res.status(500).json({ message: "❌ Error updating transaction", error: error.message });
    }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res) => {
    try {
        console.log(`🗑 Deleting transaction ${req.params.id} for user: ${req.user._id}`);

        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "❌ Transaction not found" });
        }

        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "❌ Unauthorized to delete this transaction" });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        console.log("✅ Transaction deleted:", req.params.id);

        res.status(200).json({ message: "✅ Transaction deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting transaction:", error);
        res.status(500).json({ message: "❌ Error deleting transaction", error: error.message });
    }
};

// Exporting all controller functions
module.exports = { getTransactions, addTransaction, updateTransaction, deleteTransaction };
