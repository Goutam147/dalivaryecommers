const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const ImagePath = require('../model/ImagePath');

// Ensure directory exists asynchronously
const ensureDirectory = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
};

/**
 * Processes an image buffer, generates 3 WebP sizes, saves them to disk, and creates an ImagePath record
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {String} originalName - Original uploaded filename
 * @returns {Promise<mongoose.Types.ObjectId>} - The ID of the created ImagePath document
 */
const processAndSaveImage = async (buffer, originalName) => {
    // Determine base filename without extension to sanitize and timestamp it uniquely
    const baseName = path.parse(originalName).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${baseName}-${uniqueSuffix}`;

    // Physical server directory where files live
    const outputDir = path.join(__dirname, '..', 'public', 'images', 'products');
    await ensureDirectory(outputDir);

    // Target dimensions for our 3 webp variants
    const sizes = {
        thumbnail: { width: 150, height: 150, suffix: '-thumb.webp' },
        medium: { width: 500, height: 500, suffix: '-medium.webp' },
        large: { width: 1000, height: 1000, suffix: '-large.webp' }
    };

    const paths = {};

    // Generate and save each size using Sharp
    for (const [key, config] of Object.entries(sizes)) {
        const outputPath = path.join(outputDir, fileName + config.suffix);
        await sharp(buffer)
            .resize(config.width, config.height, {
                fit: 'inside', // Maintains aspect ratio
                withoutEnlargement: true // Never scales up a tiny image beyond its native resolution
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Save the public-facing URL path
        paths[key] = `/public/images/products/${fileName}${config.suffix}`;
    }

    // Create the record in our ImagePath collection
    const imageRecord = await ImagePath.create({
        path: paths,
        altText: originalName
    });

    return imageRecord._id; // Return the ObjectId to inject into our Product
};

module.exports = { processAndSaveImage };
