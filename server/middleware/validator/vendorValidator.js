const { z } = require('zod');

// Schema for parsing phone array properly whether it comes as an array or a stringified JSON from FormData
const phoneSchema = z.preprocess((val) => {
    if (typeof val === 'string') {
        try {
            // Allows ["0987654321"] or '["0987654321"]'
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            return [val];
        } catch (e) {
            // If they just pass a single raw string '0987654321', convert to array
            return [val];
        }
    }
    return val;
}, z.array(z.string().min(10, 'Phone number must be at least 10 digits')).min(1, 'At least one phone number is required'));

const vendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required").trim(),
    address: z.string().min(1, "Address is required").trim(),
    phone: phoneSchema,
    email: z.string().email("Invalid email format").optional().or(z.literal('')),
    gstNo: z.string().optional(),
    owner: z.string().optional(),
    active: z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true' || val === '1'; // Parse strings from FormData correctly
        }
        return val;
    }, z.boolean().optional())
});

const validateVendor = (req, res, next) => {
    try {
        req.body = vendorSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ success: false, message: "Validation Error", errors: errorMessages });
        }
        return res.status(500).json({ success: false, message: "Internal Server Error during validation" });
    }
};

module.exports = { validateVendor };
