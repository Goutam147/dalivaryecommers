const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryType',
        required: true
    },
    mainCategoryName: {
        type: String,
        trim: true
    },
    listCategory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    listcategoryName: {
        type: [String],
        default: []
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
