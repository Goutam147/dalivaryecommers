const { z } = require('zod');

const categoryTypeSchema = z.object({
    name: z.string().min(2, "Category Type name must be at least 2 characters string").max(50, "Name must be under 50 characters").trim(),
    active: z.enum(['0', '1']).optional()
});

const validateCategoryType = (req, res, next) => {
    try {
        categoryTypeSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: error.errors.map(err => ({ field: err.path[0], message: err.message }))
        });
    }
};

module.exports = { validateCategoryType };
