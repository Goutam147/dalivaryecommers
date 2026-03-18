const Time = require('../model/Time');

// @desc    Create new time slot
// @route   POST /api/time
// @access  Private / Auth
const createTime = async (req, res) => {
    try {
        const { timename } = req.body;

        const timeExists = await Time.findOne({ timename: new RegExp(`^${timename}$`, 'i') });
        if (timeExists) {
            return res.status(400).json({ success: false, message: "Time slot with this name already exists" });
        }

        const time = await Time.create(req.body);
        res.status(201).json({ success: true, message: "Time slot created successfully", data: time });
    } catch (error) {
        console.error("Create Time Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating time slot", error: error.message });
    }
};

// @desc    Get all time slots
// @route   GET /api/time
// @access  Public
const getTimeSlots = async (req, res) => {
    try {
        const timeSlots = await Time.find().sort({ starttime: 1 });
        res.status(200).json({ success: true, count: timeSlots.length, data: timeSlots });
    } catch (error) {
        console.error("Get Time Slots Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching time slots" });
    }
};

// @desc    Update time slot by ID
// @route   PUT /api/time/:id
// @access  Private / Auth
const updateTime = async (req, res) => {
    try {
        const { timename } = req.body;

        if (timename) {
            const nameExists = await Time.findOne({
                timename: new RegExp(`^${timename}$`, 'i'),
                _id: { $ne: req.params.id }
            });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another time slot with this name already exists" });
            }
        }

        const time = await Time.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!time) {
            return res.status(404).json({ success: false, message: "Time slot not found" });
        }

        res.status(200).json({ success: true, message: "Time slot updated successfully", data: time });
    } catch (error) {
        console.error("Update Time Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Time slot not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating time slot", error: error.message });
    }
};

// @desc    Delete time slot
// @route   DELETE /api/time/:id
// @access  Private / Auth
const deleteTime = async (req, res) => {
    try {
        const time = await Time.findByIdAndDelete(req.params.id);
        if (!time) {
            return res.status(404).json({ success: false, message: "Time slot not found" });
        }
        res.status(200).json({ success: true, message: "Time slot deleted successfully" });
    } catch (error) {
        console.error("Delete Time Error: ", error);
        res.status(500).json({ success: false, message: "Server error deleting time slot" });
    }
};

module.exports = {
    createTime,
    getTimeSlots,
    updateTime,
    deleteTime
};
