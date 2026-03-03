const Vendor = require('../model/Vendor');

// @desc    Create new vendor
// @route   POST /api/vendor
// @access  Private / Auth
const createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);
        res.status(201).json({ success: true, message: "Vendor created successfully", data: vendor });
    } catch (error) {
        console.error("Create Vendor Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating vendor", error: error.message });
    }
};

// @desc    Get all vendors
// @route   GET /api/vendor
// @access  Private / Auth
const getVendors = async (req, res) => {
    try {
        // Find all vendors, ideally sorted by newest first
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: vendors.length, data: vendors });
    } catch (error) {
        console.error("Get Vendors Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching vendors" });
    }
};

// @desc    Get single vendor by ID
// @route   GET /api/vendor/:id
// @access  Private / Auth
const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }
        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        console.error("Get Vendor Error: ", error);
        // If the ID is improperly formatted, mongoose throws a CastError
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }
        res.status(500).json({ success: false, message: "Server error fetching vendor" });
    }
};

// @desc    Update vendor by ID
// @route   PUT /api/vendor/:id
// @access  Private / Auth
const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        res.status(200).json({ success: true, message: "Vendor updated successfully", data: vendor });
    } catch (error) {
        console.error("Update Vendor Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating vendor" });
    }
};

module.exports = {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor
};
