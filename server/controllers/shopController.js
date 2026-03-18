const ShopMaster = require('../model/ShopMaster');

// @desc    Create or Update the ShopMaster record
// @route   POST /api/shop
// @access  Private / Auth
const upsertShop = async (req, res) => {
    try {
        const updateData = req.body;

        // Check if there is already a ShopMaster record
        let shop = await ShopMaster.findOne();

        if (shop) {
            // Update the existing record using findByIdAndUpdate to trigger validators and return the new document
            shop = await ShopMaster.findByIdAndUpdate(shop._id, updateData, { new: true, runValidators: true });
            return res.status(200).json({
                success: true,
                message: "Shop updated successfully",
                data: shop
            });
        } else {
            // Create a brand new record if none exists
            shop = await ShopMaster.create(updateData);
            return res.status(201).json({
                success: true,
                message: "Shop created successfully",
                data: shop
            });
        }

    } catch (error) {
        console.error("ShopMaster Upsert Error: ", error);
        res.status(500).json({ success: false, message: "Server error during shop update", error: error.message });
    }
};

// @desc    Get the ShopMaster details
// @route   GET /api/shop
// @access  Public
const getShop = async (req, res) => {
    try {
        const shop = await ShopMaster.findOne();

        if (!shop) {
            return res.status(404).json({ success: false, message: "No shop record found" });
        }

        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        console.error("ShopMaster GET Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    upsertShop,
    getShop
};
