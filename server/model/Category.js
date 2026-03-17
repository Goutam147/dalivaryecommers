const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
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
    versionKey: false // This automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Category', categorySchema);
