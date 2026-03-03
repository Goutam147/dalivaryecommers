const Product = require('../model/Product');
const { processAndSaveImage } = require('../utils/imageHandler');

// @desc    Create new Product
// @route   POST /api/product
// @access  Private / Auth
const createProduct = async (req, res) => {
    try {
        const productData = req.validatedData; // This holds the parsed JSON from FormData

        // Process thumbnail if uploaded
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            const thumbnailFile = req.files.thumbnail[0];
            const imageId = await processAndSaveImage(thumbnailFile.buffer, thumbnailFile.originalname);
            productData.thumbnail = imageId;
        }

        // Processing 'images' array for the Product.unlinkImg list
        if (req.files && req.files.images && req.files.images.length > 0) {
            productData.unlinkImg = [];
            for (const file of req.files.images) {
                const imageId = await processAndSaveImage(file.buffer, file.originalname);
                productData.unlinkImg.push(imageId);
            }
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
            .populate('thumbnail') // Automatically populates the ImagePath record
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
            .populate('types.images');

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
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            const thumbnailFile = req.files.thumbnail[0];
            const imageId = await processAndSaveImage(thumbnailFile.buffer, thumbnailFile.originalname);
            productData.thumbnail = imageId;
        }

        // Process new 'images' array and APPEND them, or potentially overwrite based on business logic. 
        // Here we append to unlinkImg dynamically using MongoDB $push.
        if (req.files && req.files.images && req.files.images.length > 0) {
            const newImageIds = [];
            for (const file of req.files.images) {
                const imageId = await processAndSaveImage(file.buffer, file.originalname);
                newImageIds.push(imageId);
            }
            productData.$push = { unlinkImg: { $each: newImageIds } };
        }

        let updateQuery = { $set: productData };
        if (productData.$push) {
            updateQuery.$push = productData.$push;
            delete productData.$push;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateQuery, {
            new: true,
            runValidators: true
        }).populate('thumbnail').populate('unlinkImg');

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

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct
};
