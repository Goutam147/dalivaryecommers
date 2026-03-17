const { z } = require('zod');

const unitSchema = z.object({
    name: z.string().min(1, "Name is required").trim(),
    code: z.string().min(1, "Code is required").trim(),
    active: z.preprocess((val) => Number(val), z.number().int().min(0).max(1)).optional().default(1),
});

const validateUnit = (req, res, next) => {
    try {
        let dataToValidate = req.body;

        // Support for FormData with stringified JSON if needed (pattern used in other validators)
        if (req.body.data && typeof req.body.data === 'string') {
            try {
                dataToValidate = JSON.parse(req.body.data);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid JSON in data field" });
            }
        }

        const validatedData = unitSchema.parse(dataToValidate);
        req.validatedData = validatedData;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message,
                errors: error.errors
            });
        }
        next(error);
    }
};

module.exports = { validateUnit };
