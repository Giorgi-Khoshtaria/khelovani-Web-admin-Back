// config/multer.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import { CloudinaryFolder } from "../../types/cloudinaryFolder.enum.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: async (req: any, file: any) => {
      const subFolder = (req as any).cloudinaryFolder || req.query.folder || CloudinaryFolder.General;
      
      const folderName = Object.values(CloudinaryFolder).includes(subFolder as CloudinaryFolder) 
        ? subFolder 
        : CloudinaryFolder.General;
        
      return `khelovani/${folderName}`;
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    on_upload_start: (req: any, file: any) => {
      console.log("Starting upload to Cloudinary for file:", file.originalname);
    }
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("მხოლოდ სურათების ატვირთვაა ნებადართული") as any, false);
    }
  },
});

export default upload;
