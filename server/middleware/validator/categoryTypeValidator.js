const { z } = require('zod');

const categoryTypeSchema = z.object({
    name: z.string().min(2, "Category Type name must be at least 2 characters string").max(50, "Name must be under 50 characters").trim(),
    order: z.number({ coerce: true }).optional().default(0),
    active: z.number({ coerce: true }).optional().default(1)
});

const validateCategoryType = (req, res, next) => {
    try {
        // Handle FormData JSON payload
        let payload = req.body;
        if (req.body.data && typeof req.body.data === 'string') {
            payload = JSON.parse(req.body.data);
        }

        const validData = categoryTypeSchema.parse(payload);
        req.validatedData = validData;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
            });
        }
        return res.status(500).json({ success: false, message: "Internal Server Error during validation", error: error.message });
    }
};

module.exports = { validateCategoryType };
