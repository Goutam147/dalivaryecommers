const mongoose = require('mongoose');

// Schema for tracking order progress
const trackSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    versionKey: false // This will automatically add 'createdAt' inside each track object
});

// Schema for charges inside the item or order
const chargeSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    amount: { type: Number, required: true }
});

// Schema for each item in the order
const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    unit: { type: String, trim: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    qty: { type: Number, required: true },
    total: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    charges: [chargeSchema]
});

// Main OrderMaster schema
const orderMasterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timeslotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Time', required: true },
    shiftAddress: {
        type: mongoose.Schema.Types.Mixed, // Allows saving an object containing house no, street, or just a string ID
        required: true
    },
    phone: {
        type: [String],
        default: []
    },
    items: [orderItemSchema],
    status: {
        type: String,
        default: 'Pending',
        trim: true
    },
    overallcharges: [chargeSchema],
    uniquecode: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    invoice: {
        type: String,
        unique: true,
        trim: true
    },
    track: [trackSchema],
    otpPin: {
        type: String,
        trim: true
    },
    recordType: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false // This automatically adds 'createdAt' and 'updatedAt' for the whole order
});

module.exports = mongoose.model('OrderMaster', orderMasterSchema);
