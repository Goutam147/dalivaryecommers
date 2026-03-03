const { z } = require('zod');

// Defined Zod schema for Category validation
const categorySchema = z.object({
    name: z.string().min(1, "Category name is required").trim()
});

// Middleware function to validate requests against the Zod schema
const validateCategory = (req, res, next) => {
    try {
        req.body = categorySchema.parse(req.body);
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
    validateCategory
};
