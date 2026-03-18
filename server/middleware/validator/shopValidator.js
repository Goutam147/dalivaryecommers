const { z } = require('zod');

// Defined Zod schema for ShopMaster validation
const shopSchema = z.object({
    appName: z.string().min(1, "App Name is required").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    phone: z.string().min(10, "Phone number must be at least 10 characters").trim(),
    address: z.object({
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        post: z.string().optional(),
        block: z.string().optional(),
        dist: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        Latitude: z.string().optional(),
        Longitude: z.string().optional()
    }).optional(),
    ownerName: z.string().min(1, "Owner Name is required").trim(),
    gst: z.object({
        set: z.boolean().default(false),
        gstNo: z.string().optional()
    }).optional(),
    prefix: z.string().optional(),
    theme: z.array(z.string()).optional(),
    whatsappApi: z.object({
        set: z.boolean().default(false),
        apiKey: z.string().optional(),
        customerReg: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional(),
        orderConfirm: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional(),
        orderShiped: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional(),
        orderDelivered: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional(),
        orderCancel: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional(),
        otp: z.object({
            set: z.boolean().default(false),
            template: z.string().optional()
        }).optional()
    }).optional(),
    logo: z.string().optional(),
    fevicon: z.string().optional(),
    CopyrightMsg: z.string().optional(),
    smtp: z.object({
        set: z.boolean().default(false),
        host: z.string().optional(),
        port: z.string().optional(),
        user: z.string().optional(),
        pass: z.string().optional(),
        from: z.string().optional(),
        fromName: z.string().optional(),
        apiKey: z.string().optional()
    }).optional(),
    gmapapi: z.object({
        set: z.boolean().default(false),
        apiKey: z.string().optional()
    }).optional(),
    paymentMethod: z.object({
        razorpay: z.object({
            set: z.boolean().default(false),
            apiKey: z.string().optional(),
            secretKey: z.string().optional()
        }).optional(),
        cashOnDelivery: z.object({
            set: z.boolean().default(false)
        }).optional(),
        nodelivery: z.object({
            set: z.boolean().default(false)
        }).optional(),
        paytm: z.object({
            set: z.boolean().default(false),
            apiKey: z.string().optional(),
            secretKey: z.string().optional()
        }).optional()
    }).optional(),
    miniFreeDelivery: z.object({
        set: z.boolean().default(false),
        amount: z.string().optional()
    }).optional(),
    availablePincode: z.array(z.string()).optional()
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
