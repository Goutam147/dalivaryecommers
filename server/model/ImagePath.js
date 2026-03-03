const mongoose = require('mongoose');

const imagePathSchema = new mongoose.Schema({
    path: {
        thumbnail: { type: String, trim: true },
        medium: { type: String, trim: true },
        large: { type: String, trim: true }
    },
    altText: {
        type: String,
        maxLength: 50,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false // This automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('ImagePath', imagePathSchema);
