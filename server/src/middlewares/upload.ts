import multer from "multer";

// Store uploaded files in memory as buffers so we can
// stream them directly to Cloudinary without writing to disk.
const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export default upload;
