const CategoryType = require('../model/CategoryType');

// @desc    Create new category type
// @route   POST /api/category-type
// @access  Private / Auth
const createCategoryType = async (req, res) => {
    try {
        const { name } = req.body;

        const exists = await CategoryType.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (exists) {
            return res.status(400).json({ success: false, message: "Category Type already exists" });
        }

        const categoryType = await CategoryType.create({ name });
        res.status(201).json({ success: true, message: "Category Type created successfully", data: categoryType });
    } catch (error) {
        console.error("Create Category Type Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all active category types
// @route   GET /api/category-type
// @access  Public
const getCategoryTypes = async (req, res) => {
    try {
        // Find all and sort descending by creation or ascending by name
        const categoryTypes = await CategoryType.find().sort({ name: 1 }); // ASC order by name
        res.status(200).json({ success: true, count: categoryTypes.length, data: categoryTypes });
    } catch (error) {
        console.error("Get Category Types Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update a specific category type
// @route   PUT /api/category-type/:id
// @access  Private / Auth
const updateCategoryType = async (req, res) => {
    try {
        const { name } = req.body;

        let existingType = await CategoryType.findById(req.params.id);
        if (!existingType) {
            return res.status(404).json({ success: false, message: "Category Type not found" });
        }

        if (name && name !== existingType.name) {
            const nameExists = await CategoryType.findOne({ _id: { $ne: req.params.id }, name: new RegExp(`^${name}$`, 'i') });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another Category Type with this name already exists" });
            }
        }

        const updatedCategoryType = await CategoryType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, message: "Category Type updated completely", data: updatedCategoryType });
    } catch (error) {
        console.error("Update Category Type Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete a category type
// @route   DELETE /api/category-type/:id
// @access  Private / Auth
const deleteCategoryType = async (req, res) => {
    try {
        const categoryType = await CategoryType.findById(req.params.id);
        if (!categoryType) {
            return res.status(404).json({ success: false, message: "Category Type not found" });
        }
        await CategoryType.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Category Type deleted successfully" });
    } catch (error) {
        console.error("Delete Category Type Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    createCategoryType,
    getCategoryTypes,
    updateCategoryType,
    deleteCategoryType
};
