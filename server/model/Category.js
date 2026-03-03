const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false // This automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Category', categorySchema);
