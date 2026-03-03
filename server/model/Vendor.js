const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: [String],
        required: true,
        default: []
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    gstNo: {
        type: String,
        trim: true
    },
    owner: {
        type: String, // Can just be a string for names, or an ObjectId ref to user 
        trim: true
    },
    active: {
        type: Boolean, // Storing as boolean, 1/true or 0/false
        default: true
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Vendor', vendorSchema);
