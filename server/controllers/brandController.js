const Brand = require('../model/Brand');

// @desc    Create new brand
// @route   POST /api/brand
// @access  Private / Auth
const createBrand = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if a brand with this exact name already exists (case-insensitive)
        const brandExists = await Brand.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (brandExists) {
            return res.status(400).json({ success: false, message: "Brand with this name already exists" });
        }

        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, message: "Brand created successfully", data: brand });
    } catch (error) {
        console.error("Create Brand Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating brand", error: error.message });
    }
};

// @desc    Get all brands
// @route   GET /api/brand
// @access  Public
const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        console.error("Get Brands Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching brands" });
    }
};

// @desc    Update brand by ID
// @route   PUT /api/brand/:id
// @access  Private / Auth
const updateBrand = async (req, res) => {
    try {
        const { name } = req.body;

        // Verify another brand doesn't already have this name
        if (name) {
            const nameExists = await Brand.findOne({
                name: new RegExp(`^${name}$`, 'i'),
                _id: { $ne: req.params.id }
            });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another brand with this name already exists" });
            }
        }

        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }

        res.status(200).json({ success: true, message: "Brand updated successfully", data: brand });
    } catch (error) {
        console.error("Update Brand Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating brand", error: error.message });
    }
};

module.exports = {
    createBrand,
    getBrands,
    updateBrand
};
