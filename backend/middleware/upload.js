import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Store uploads directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "shoplux/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
