const mongoose = require('mongoose');

const shopMasterSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        addressLine1: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        dist: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        }
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    gstNo: {
        type: String,
        trim: true
    },
    prefix: {
        type: String,
        trim: true
    },
    wpApiKey: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('ShopMaster', shopMasterSchema);
