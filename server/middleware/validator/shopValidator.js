const { z } = require('zod');

// Defined Zod schema for ShopMaster validation
const shopSchema = z.object({
    shopName: z.string().min(1, "Shop Name is required").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    phone: z.string().min(10, "Phone number must be at least 10 characters").trim(),
    address: z.object({
        addressLine1: z.string().min(1, "Address Line 1 is required").trim(),
        city: z.string().min(1, "City is required").trim(),
        dist: z.string().min(1, "District is required").trim(),
        state: z.string().min(1, "State is required").trim(),
        pincode: z.string().min(1, "Pincode is required").trim()
    }),
    ownerName: z.string().min(1, "Owner Name is required").trim(),
    gstNo: z.string().optional(),
    prefix: z.string().optional(),
    wpApiKey: z.string().optional()
});

// Middleware function to validate requests against the Zod schema
const validateShop = (req, res, next) => {
    try {
        // Because multipart/form-data might send nested objects like 'address' as a stringified JSON
        if (typeof req.body.address === 'string') {
            try {
                req.body.address = JSON.parse(req.body.address);
            } catch (e) { }
        }

        // Zod will parse and validate the request body
        shopSchema.parse(req.body);

        // Validation passed, proceed to the controller
        next();
    } catch (error) {
        // If Zod validation fails, it throws a ZodError
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

        // Catch any other unexpected errors
        return res.status(500).json({ success: false, message: "Internal Server Error during validation" });
    }
};

module.exports = {
    validateShop
};
