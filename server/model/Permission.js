const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    codeName: {
        type: String,
        required: true,
        unique: true,
        trim: true
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

module.exports = mongoose.model('Permission', permissionSchema);
