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
    },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false // This will automatically add 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('CategoryType', categoryTypeSchema);
