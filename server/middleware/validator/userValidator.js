const { z } = require('zod');

// Defined Zod schema for signup validation
const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").max(50),
    email: z.string().email("Invalid email address format").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 characters").max(15),
    password: z.string().min(6, "Password must be at least 6 characters long").optional().or(z.literal('')),
    role: z.enum(['admin', 'customer', 'staff', 'deliverypartner']).optional()
});

// Middleware function to validate requests against the Zod schema
const validateSignup = (req, res, next) => {
    try {
        // Zod will parse and validate the request body
        // If successful, it returns the parsed data. We don't need to reassign it unless we want to strip unknown fields.
        signupSchema.parse(req.body);

        // Validation passed, proceed to the controller
        next();
    } catch (error) {
        // If Zod validation fails, it throws a ZodError
        if (error instanceof z.ZodError) {
            // Format Zod errors nicely to return to the frontend
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

// Defined Zod schema for login validation
const loginSchema = z.object({
    emailOrPhone: z.string().min(3, "Email or phone is required"),
    password: z.string().min(1, "Password is required")
});

const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
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

module.exports = {
    validateSignup,
    validateLogin
};
