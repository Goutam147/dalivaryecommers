const { z } = require('zod');

// Schema for parsing model array properly whether it comes as an array or a stringified JSON from FormData
const stringArraySchema = z.preprocess((val) => {
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            if (val.trim() === '') return []; // Empty strings map to empty arrays
            return [val];
        } catch (e) {
            return [val];
        }
    }
    // If undefined or empty, return default empty array for Zod to validate
    return val || [];
}, z.array(z.string()).optional());

// Defined Zod schema for Brand validation
const brandSchema = z.object({
    name: z.string().min(1, "Brand name is required").trim(),
    model: stringArraySchema,
    active: z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true' || val === '1'; // Parse strings from FormData correctly
        }
        return val;
    }, z.boolean().optional())
});

// Middleware function to validate requests against the Zod schema
const validateBrand = (req, res, next) => {
    try {
        req.body = brandSchema.parse(req.body);
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
    validateBrand
};
