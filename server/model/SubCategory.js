const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    subCategoryName: {
        type: String,
        trim: true
    },
    subCategoryImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImagePath'
    },
    mainCategory: {
        name: {
            type: String,
            trim: true
        },
        mainCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }
    },
    categoryType: [
        {
            name: {
                type: String,
                trim: true
            },
            categoryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CategoryType'
            }
        }
    ],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
