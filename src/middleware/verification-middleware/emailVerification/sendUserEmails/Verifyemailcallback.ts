import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../../../models/user.model.js";

interface JwtPayload {
  email: string;
}

export const verifyEmailCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "ტოკენი არ მოიძებნა" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
      return;
    }

    if (user.isVerified) {
      // ✅ JSON instead of redirect
      res.status(200).json({ status: "already_verified" });
      return;
    }

    await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true });

    // ✅ JSON instead of redirect
    res.status(200).json({ status: "verified" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(400).json({
        status: "error",
        code: "expired",
        message:
          "ვერიფიკაციის ლინკის ვადა გასულია. გთხოვთ ხელახლა დარეგისტრირდეთ.",
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        status: "error",
        code: "invalid",
        message: "ლინკი არასწორია ან დაზიანებულია.",
      });
      return;
    }
    res.status(500).json({
      status: "error",
      code: "server",
      message: "სერვერის შეცდომა. სცადეთ მოგვიანებით.",
    });
  }
};
