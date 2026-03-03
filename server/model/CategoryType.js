const mongoose = require('mongoose');

const categoryTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    }
}, {
    timestamps: true,
    versionKey: false // This will automatically add 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('CategoryType', categoryTypeSchema);
