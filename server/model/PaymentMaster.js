const mongoose = require('mongoose');

const paymentMasterSchema = new mongoose.Schema({
    flowType: {
        type: String,
        enum: ['inflow', 'outflow'],
        required: true,
        trim: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderMaster',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        required: true,
        trim: true // e.g., 'Credit Card', 'Cash', 'UPI'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    remark: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('PaymentMaster', paymentMasterSchema);
