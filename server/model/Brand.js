const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    model: {
        type: [String], // Array of strings representing models
        default: []
    },
    active: {
        type: Boolean, // Storing as boolean, 1/true or 0/false
        default: true
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Brand', brandSchema);
