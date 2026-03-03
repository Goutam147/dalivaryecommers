const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        // Replace 'Company' with your actual company collection name if it exists, 
        // e.g. ref: 'ShopMaster' depending on your architecture
        required: true
    },
    Expenseid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    },
    transactiontype: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'cradit'], // included both spellings just in case! usually it's credit
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        trim: true // e.g., 'Cash', 'UPI', 'Bank Transfer'
    },
    afterbalance: {
        type: Number
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false // This automatically handles 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Ledger', ledgerSchema);
