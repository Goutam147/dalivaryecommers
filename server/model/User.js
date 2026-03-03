const mongoose = require('mongoose');

const addressDetailSchema = new mongoose.Schema({
    houseNo: { type: String, trim: true },
    street: { type: String, trim: true },
    locality: { type: String, trim: true },
    landmark: { type: String, trim: true },
    vill: { type: String, trim: true },
    post: { type: String, trim: true },
    ps: { type: String, trim: true },
    dist: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phone: {
        type: [String],
        default: []
    },
    location: { type: String, trim: true } // Could also be GeoJSON if you need coordinates
}, {
    timestamps: true,
    versionKey: false // This will add createdAt and updatedAt for each address
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String, // will store the hash
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'customer', 'staff', 'deliverypartner'],
        default: 'customer',
        trim: true
    },
    permissions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Permission',
        default: []
    },
    active: {
        type: Boolean, // Or Number if you strictly want 0 or 1
        default: true
    },
    addressDetails: [addressDetailSchema]
}, {
    timestamps: true,
    versionKey: false // This automatically adds 'createdAt' and 'updatedAt' for the user
});

module.exports = mongoose.model('User', userSchema);
