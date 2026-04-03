const mongoose = require('mongoose');

// Schema for charge objects inside the charges array
const chargeSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, trim: true } // e.g., 'fixed', 'percentage'
});

// Schema for elements inside the types array
const productTypeSchema = new mongoose.Schema({
    qty: { type: Number, required: true },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    description: { type: String, trim: true },
    maxOrder: { type: Number, default: 1 },
    info: { type: mongoose.Schema.Types.Mixed }, // Mixed type allows any object structure
    verified: { type: Boolean, default: false }, // Boolean default is false (0)
    veg: { type: Boolean, default: false }, // Boolean default is false (0)
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    }]
});

// Main Product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    title: {
        type: [String],
        default: []
    },
    unlinkImg: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    }],
    categoryTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryType'
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    }],
    thumbnail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    },
    types: [productTypeSchema],
    returnPolicy: { // Renamed from "return" as "return" is a reserved keyword in JS
        type: String,
        trim: true
    },
    review: {
        count: { type: Number, default: 0 },
        starValue: { type: Number, default: 0.0 } // Can hold decimal, like 4.5
    },
    charges: [chargeSchema],
    expectedTime: {
        type: String,
        trim: true // e.g., '30 mins', '1 hour'
    },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    setImg: {
        type: String,
        enum: ['combine', 'split'],
        default: 'combine'
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Product', productSchema);
