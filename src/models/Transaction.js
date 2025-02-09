const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    frequency: { 
        type: String, 
        enum: ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'], 
        default: 'once' 
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
