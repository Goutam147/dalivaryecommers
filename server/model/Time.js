const mongoose = require('mongoose');

const timeSchema = new mongoose.Schema({
    timename: {
        type: String,
        required: [true, 'Time slot name is required'],
        trim: true
    },
    starttime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid start time in 24h format (HH:mm)']
    },
    endtime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid end time in 24h format (HH:mm)']
    },
    lastOrderTime: {
        type: String,
        required: [true, 'Last order time is required'],
        match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid last order time in 24h format (HH:mm)']
    },
    active: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Time', timeSchema);
