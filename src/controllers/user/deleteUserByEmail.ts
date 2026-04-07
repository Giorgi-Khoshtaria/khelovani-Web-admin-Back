import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";

// @desc    Delete user by email (for test cleanup)
// @route   DELETE /api/user/delete-by-email
// @access  Public (should be protected in production)
export const deleteUserByEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Environment check for safety
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ message: "Operation not allowed in production" });
      return;
    }

    const { email } = req.body;
    const result = await User.deleteOne({ email: email.trim().toLowerCase() });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
