const Category = require('../model/Category');
const { processAndSaveImage } = require('../utils/imageHandler');
const ImagePath = require('../model/ImagePath');
// @desc    Create new category
// @route   POST /api/category
// @access  Private / Auth
const createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;

        const categoryExists = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Category with this name already exists" });
        }

        let imageId = req.body.image || null; // fallback if passed by an ID string
        if (req.file) {
            imageId = await processAndSaveImage(req.file.buffer, req.file.originalname, 'category');
        }

        const category = await Category.create({ name, image: imageId });
        res.status(201).json({ success: true, message: "Category created successfully", data: category });
    } catch (error) {
        console.error("Create Category Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating category", error: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/category
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('image').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error("Get Categories Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching categories" });
    }
};

// @desc    Update category by ID
// @route   PUT /api/category/:id
// @access  Private / Auth
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Verify another category doesn't already have this name
        if (name) {
            const nameExists = await Category.findOne({
                name: new RegExp(`^${name}$`, 'i'),
                _id: { $ne: req.params.id }
            });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another category with this name already exists" });
            }
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = await processAndSaveImage(req.file.buffer, req.file.originalname, 'category');
        }

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('image');

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", data: category });
    } catch (error) {
        console.error("Update Category Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating category", error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory
};
