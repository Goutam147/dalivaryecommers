const Product = require('../model/Product');
const { processAndSaveImage } = require('../utils/imageHandler');

// @desc    Create new Product
// @route   POST /api/product
// @access  Private / Auth
const createProduct = async (req, res) => {
    try {
        const productData = req.validatedData; // This holds the parsed JSON from FormData

        // Process thumbnail if uploaded (multer.any() returns an array of files)
        const thumbnailFiles = req.files ? req.files.filter(f => f.fieldname === 'thumbnail') : [];
        if (thumbnailFiles.length > 0) {
            const thumbnailFile = thumbnailFiles[0];
            const imageId = await processAndSaveImage(thumbnailFile.buffer, thumbnailFile.originalname);
            productData.thumbnail = imageId;
        }

        // Process generalized Image gallery natively mapping to root `images` instead of nested structures
        const galleryFiles = req.files ? req.files.filter(f => f.fieldname === 'images' || f.fieldname === 'images[]') : [];
        if (galleryFiles.length > 0) {
            const uploadedImageIds = [];
            for (const file of galleryFiles) {
                const imageId = await processAndSaveImage(file.buffer, file.originalname, 'products');
                uploadedImageIds.push(imageId);
            }
            productData.images = uploadedImageIds;
        }

        const product = await Product.create(productData);
        res.status(201).json({ success: true, message: "Product created successfully", data: product });
    } catch (error) {
        console.error("Create Product Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating product", error: error.message });
    }
};

// @desc    Get all Products
// @route   GET /api/product
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('thumbnail')
            .populate('images')
            .populate('brandId')
            .populate('categoryTypeId')
            .populate('types.unitId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error("Get Products Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching products" });
    }
};

// @desc    Get Product By ID
// @route   GET /api/product/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('thumbnail')
            .populate('unlinkImg')
            .populate('images')
            .populate('brandId')
            .populate('categoryTypeId')
            .populate('types.unitId');

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Get Product Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(500).json({ success: false, message: "Server error fetching product" });
    }
};

// @desc    Update Product
// @route   PUT /api/product/:id
// @access  Private / Auth
const updateProduct = async (req, res) => {
    try {
        const productData = req.validatedData;

        // Process new thumbnail if uploaded
        const thumbnailFiles = req.files ? req.files.filter(f => f.fieldname === 'thumbnail') : [];
        if (thumbnailFiles.length > 0) {
            const thumbnailFile = thumbnailFiles[0];
            const imageId = await processAndSaveImage(thumbnailFile.buffer, thumbnailFile.originalname, 'products');
            productData.thumbnail = imageId;
        }

        // Process updated generalized gallery logic appending directly to root `images`
        const galleryFiles = req.files ? req.files.filter(f => f.fieldname === 'images' || f.fieldname === 'images[]') : [];
        if (galleryFiles.length > 0) {
            const uploadedImageIds = [];
            for (const file of galleryFiles) {
                const imageId = await processAndSaveImage(file.buffer, file.originalname, 'products');
                uploadedImageIds.push(imageId);
            }
            // If images were already present in productData as IDs (from existing list), merge them
            productData.images = [...(productData.images || []), ...uploadedImageIds];
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, {
            new: true,
            runValidators: true
        }).populate('thumbnail').populate('images').populate('brandId').populate('categoryTypeId').populate('types.unitId');

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product updated successfully", data: product });
    } catch (error) {
        console.error("Update Product Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating product", error: error.message });
    }
};

// @desc    Delete Product
// @route   DELETE /api/product/:id
// @access  Private / Auth
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error: ", error);
        res.status(500).json({ success: false, message: "Server error deleting product" });
    }
};

// @desc    Delete Specific Product Image
// @route   DELETE /api/product/:productId/images/:imageId
// @access  Private / Auth
const deleteProductImage = async (req, res) => {
    try {
        const { productId, imageId } = req.params;

        const product = await Product.findByIdAndUpdate(
            productId,
            { $pull: { images: imageId } },
            { new: true }
        ).populate('images');

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Image removed from product gallery", data: product });
    } catch (error) {
        console.error("Delete Product Image Error: ", error);
        res.status(500).json({ success: false, message: "Server error removing image" });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteProductImage
};
