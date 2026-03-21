import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";

import mongoose from "mongoose";

export const getPartnerById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "არასწორი პარტნიორის ID" });
      return;
    }

    const partner = await Organisation.findById(id).select("-password");

    if (!partner) {
      res.status(404).json({ message: "პარტნიორი ვერ მოიძებნა" });
      return;
    }

    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllPartners = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const partners = await Organisation.find().select("-password");

    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
