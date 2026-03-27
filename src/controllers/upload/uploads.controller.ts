import type { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "ფაილი არ არის ატვირთული" });
      return;
    }

    // Cloudinary path is available in req.file.path when using multer-storage-cloudinary
    const imageUrl = req.file.path;

    res.status(200).json({
      message: "ფაილი წარმატებით აიტვირთა",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა ფაილის ატვირთვისას" });
  }
};
