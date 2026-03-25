const { z } = require('zod');

// Defined Zod schema for SubCategory validation
const subCategorySchema = z.object({
    subCategoryName: z.string().min(1, "Sub-Category Name is required").trim(),
    subCategoryImage: z.string().optional(),
    mainCategory: z.object({
        name: z.string().min(1, "Main Category Name is required").trim(),
        mainCategoryId: z.string().min(1, "Main Category ID is required")
    }),
    categoryType: z.array(z.object({
        name: z.string().min(1, "Category Type Name is required").trim(),
        categoryId: z.string().min(1, "Category Type ID is required")
    })).min(1, "At least one Category Type is required"),
    active: z.boolean().default(true)
});

// Middleware function to validate requests against the Zod schema
const validateSubCategory = (req, res, next) => {
    try {
        // Because multipart/form-data might send nested objects like 'mainCategory' as a stringified JSON
        if (typeof req.body.mainCategory === 'string') {
            try {
                req.body.mainCategory = JSON.parse(req.body.mainCategory);
            } catch (e) { }
        }
        if (typeof req.body.categoryType === 'string') {
            try {
                req.body.categoryType = JSON.parse(req.body.categoryType);
            } catch (e) { }
        }

        // Convert 'active' string to boolean if necessary (e.g. from FormData)
        if (req.body.active === 'true') req.body.active = true;
        if (req.body.active === 'false') req.body.active = false;

        // Zod will parse and validate the request body
        req.validatedData = subCategorySchema.parse(req.body);

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages
            });
        }
        return res.status(500).json({ success: false, message: "Internal Server Error during validation" });
    }
};

module.exports = {
    validateSubCategory
};
