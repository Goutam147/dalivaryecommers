const SubCategory = require('../model/SubCategory');
const { processAndSaveImage } = require('../utils/imageHandler');

// @desc    Create new sub-category
// @route   POST /api/sub-category
// @access  Private / Auth
const createSubCategory = async (req, res) => {
    try {
        const subCategoryData = req.validatedData;

        // Process image if uploaded
        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const imageId = await processAndSaveImage(file.buffer, file.originalname, 'subcategory');
            subCategoryData.subCategoryImage = imageId;
        }

        const exists = await SubCategory.findOne({
            subCategoryName: new RegExp(`^${subCategoryData.subCategoryName}$`, 'i'),
            "mainCategory.mainCategoryId": subCategoryData.mainCategory.mainCategoryId
        });
        if (exists) {
            return res.status(400).json({ success: false, message: "Sub-Category already exists under this main category" });
        }

        const subCategory = await SubCategory.create(subCategoryData);
        res.status(201).json({ success: true, message: "Sub-Category created successfully", data: subCategory });
    } catch (error) {
        console.error("Create Sub-Category Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all active sub-categories
// @route   GET /api/sub-category
// @access  Public
const getSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find()
            .populate('subCategoryImage')
            .populate('mainCategory.mainCategoryId')
            .populate('categoryType.categoryId')
            .sort({ subCategoryName: 1 });
        res.status(200).json({ success: true, count: subCategories.length, data: subCategories });
    } catch (error) {
        console.error("Get Sub-Categories Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update a specific sub-category
// @route   PUT /api/sub-category/:id
// @access  Private / Auth
const updateSubCategory = async (req, res) => {
    try {
        const subCategoryData = req.validatedData;

        let existingSub = await SubCategory.findById(req.params.id);
        if (!existingSub) {
            return res.status(404).json({ success: false, message: "Sub-Category not found" });
        }

        if (subCategoryData.subCategoryName && (subCategoryData.subCategoryName !== existingSub.subCategoryName || subCategoryData.mainCategory.mainCategoryId !== existingSub.mainCategory.mainCategoryId)) {
            const nameExists = await SubCategory.findOne({
                _id: { $ne: req.params.id },
                subCategoryName: new RegExp(`^${subCategoryData.subCategoryName}$`, 'i'),
                "mainCategory.mainCategoryId": subCategoryData.mainCategory.mainCategoryId
            });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another Sub-Category with this name already exists under this main category" });
            }
        }

        // Process new image if uploaded
        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const imageId = await processAndSaveImage(file.buffer, file.originalname, 'subcategory');
            subCategoryData.subCategoryImage = imageId;
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(req.params.id, subCategoryData, {
            new: true,
            runValidators: true
        }).populate('subCategoryImage').populate('mainCategory.mainCategoryId').populate('categoryType.categoryId');

        res.status(200).json({ success: true, message: "Sub-Category updated successfully", data: updatedSubCategory });
    } catch (error) {
        console.error("Update Sub-Category Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete a sub-category
// @route   DELETE /api/sub-category/:id
// @access  Private / Auth
const deleteSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-Category not found" });
        }
        await SubCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Sub-Category deleted successfully" });
    } catch (error) {
        console.error("Delete Sub-Category Error: ", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    createSubCategory,
    getSubCategories,
    updateSubCategory,
    deleteSubCategory
};
