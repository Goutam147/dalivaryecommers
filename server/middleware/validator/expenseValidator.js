const { z } = require('zod');

// Defined Zod schema for Expense validation
const expenseSchema = z.object({
    name: z.string().min(1, "Expense name is required").trim(),
    active: z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true' || val === '1'; // Parse strings from FormData correctly
        }
        return val;
    }, z.boolean().optional())
});

// Middleware function to validate requests against the Zod schema
const validateExpense = (req, res, next) => {
    try {
        req.body = expenseSchema.parse(req.body);
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
    validateExpense
};
