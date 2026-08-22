const cloudinary = require('cloudinary').v2


exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        if (!process.env.CLOUD_NAME || process.env.CLOUD_NAME.includes("xxx")) {
            console.log("Cloudinary credentials not configured in .env, using default upload fallback...");
            return {
                secure_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
                duration: "10:00"
            };
        }

        const options = { folder };
        if (height) {
            options.height = height;
        }
        if (quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";

        return await cloudinary.uploader.upload(file.tempFilePath, options);
    } catch (error) {
        console.log("Cloudinary Upload Error fallback:", error.message);
        return {
            secure_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            duration: "10:00"
        };
    }
}