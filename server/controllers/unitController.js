const Unit = require('../model/Unit');

// @desc    Create new unit
// @route   POST /api/unit
// @access  Private / Auth
const createUnit = async (req, res) => {
    try {
        const unitData = req.validatedData;

        const exists = await Unit.findOne({
            $or: [
                { name: new RegExp(`^${unitData.name}$`, 'i') },
                { code: new RegExp(`^${unitData.code}$`, 'i') }
            ]
        });

        if (exists) {
            return res.status(400).json({ success: false, message: "Unit name or code already exists" });
        }

        const unit = await Unit.create(unitData);
        res.status(201).json({ success: true, message: "Unit created successfully", data: unit });
    } catch (error) {
        console.error("Create Unit Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all units
// @route   GET /api/unit
// @access  Public
const getUnits = async (req, res) => {
    try {
        const units = await Unit.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: units.length, data: units });
    } catch (error) {
        console.error("Get Units Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update a specific unit
// @route   PUT /api/unit/:id
// @access  Private / Auth
const updateUnit = async (req, res) => {
    try {
        const unitData = req.validatedData;

        let existingUnit = await Unit.findById(req.params.id);
        if (!existingUnit) {
            return res.status(404).json({ success: false, message: "Unit not found" });
        }

        // Check for duplicates
        if (unitData.name || unitData.code) {
            const duplicate = await Unit.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { name: new RegExp(`^${unitData.name}$`, 'i') },
                    { code: new RegExp(`^${unitData.code}$`, 'i') }
                ]
            });
            if (duplicate) {
                return res.status(400).json({ success: false, message: "Another unit with this name or code already exists" });
            }
        }

        const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, unitData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, message: "Unit updated successfully", data: updatedUnit });
    } catch (error) {
        console.error("Update Unit Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete a unit
// @route   DELETE /api/unit/:id
// @access  Private / Auth
const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ success: false, message: "Unit not found" });
        }
        await Unit.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Unit deleted successfully" });
    } catch (error) {
        console.error("Delete Unit Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    createUnit,
    getUnits,
    updateUnit,
    deleteUnit
};
