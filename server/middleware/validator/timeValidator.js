const { z } = require('zod');

const timeSchema = z.object({
    timename: z.string().min(1, "Time slot name is required").trim(),
    starttime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid start time (HH:mm)"),
    endtime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid end time (HH:mm)"),
    lastOrderTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid last order time (HH:mm)"),
    active: z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true' || val === '1';
        }
        return val;
    }, z.union([z.boolean(), z.number()]).optional())
});

const validateTime = (req, res, next) => {
    try {
        req.body = timeSchema.parse(req.body);
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
    validateTime
};
