const { z } = require('zod');

// Schema for charge objects inside the charges array
const chargeSchema = z.object({
    name: z.string().optional(),
    amount: z.number({ coerce: true }).min(0, "Amount must be positive"),
    type: z.string().optional()
});

// Schema for elements inside the types array
const productTypeSchema = z.object({
    qty: z.number({ coerce: true }).min(1, "Quantity must be at least 1"),
    price: z.number({ coerce: true }).min(0, "Price must be positive"),
    mrp: z.number({ coerce: true }).min(0, "MRP must be positive"),
    description: z.string().optional(),
    maxOrder: z.number({ coerce: true }).optional().default(1),
    info: z.any().optional(),
    verified: z.boolean({ coerce: true }).optional().default(false)
});

// Main Product schema
const productValidationSchema = z.object({
    name: z.string().min(1, "Product name is required").trim(),
    description: z.string().optional(),
    title: z.array(z.string()).optional().default([]),
    brand: z.string().optional(),
    categoryId: z.string().optional(),
    unit: z.string().min(1, "Unit is required").trim(),
    types: z.array(productTypeSchema).optional().default([]),
    returnPolicy: z.string().optional(),
    review: z.object({
        count: z.number({ coerce: true }).optional().default(0),
        starValue: z.number({ coerce: true }).optional().default(0.0)
    }).optional(),
    charges: z.array(chargeSchema).optional().default([]),
    expectedTime: z.string().optional()
});

const validateProduct = (req, res, next) => {
    try {
        // Since we are using FormData to upload images, the complex JSON payload should be sent as a stringified object in the 'data' field
        let payload = req.body;
        if (req.body.data && typeof req.body.data === 'string') {
            payload = JSON.parse(req.body.data);
        }

        const validData = productValidationSchema.parse(payload);

        // Attach the validated data to req.validatedData so the controller can use the cleanly parsed JSON
        req.validatedData = validData;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ success: false, message: "Validation Error", errors: errorMessages });
        }
        return res.status(500).json({ success: false, message: "Internal Server Error during validation", error: error.message });
    }
};

module.exports = { validateProduct };
