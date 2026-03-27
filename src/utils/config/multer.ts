// config/multer.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: async (req: any, file: any) => {
      const subFolder = req.query.folder || "general";
      return `khelovani/${subFolder}`;
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as any,
});

const upload = multer({ storage });

export default upload;
