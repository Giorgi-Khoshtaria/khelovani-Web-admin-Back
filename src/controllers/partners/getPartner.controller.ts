import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPartnerPasswordEmail } from "../../utils/email/sendPartnerEmail.js";
import { ROLES } from "../../middleware/role/permissions.js";

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

    // Check if user is admin or is viewing their own profile
    if (req.user?.role !== ROLES.ADMIN && req.user?.id !== id) {
      res.status(403).json({ message: "წვდომა აკრძალულია" });
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
    const { search, status } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { companyNameGe: { $regex: search, $options: "i" } },
        { companyNameEn: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const partners = await Organisation.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updatePartnerStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "არასწორი პარტნიორის ID" });
      return;
    }

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({ message: "პარტნიორი ვერ მოიძებნა" });
      return;
    }

    if (!Object.values(PartnerStatusEnum).includes(status as any)) {
      res.status(400).json({ message: "არასწორი სტატუსი" });
      return;
    }

    if (status === PartnerStatusEnum.REJECTED) {
      await partner.replaceOne({
        _id: id,
        identificationCode: partner.identificationCode,
        status: PartnerStatusEnum.REJECTED,
        companyNameGe: partner.companyNameGe,
        companyNameEn: partner.companyNameEn,
        role: partner.role,
      });
      res
        .status(200)
        .json({ message: "პარტნიორი უარყოფილია და წაიშალა ბაზიდან" });
      return;
    }

    if (status === PartnerStatusEnum.APPROVED) {
      try {
        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        partner.password = hashedPassword;

        await sendPartnerPasswordEmail(
          partner.email,
          partner.companyNameGe,
          plainPassword,
        );
      } catch (emailError) {
        res
          .status(500)
          .json({ message: "მეილის გაგზავნა ჩაიშალა, სტატუსი არ განახლებულა" });
        return;
      }
    }

    partner.status = status;
    await partner.save();

    res.status(200).json({ message: "პარტნიორის სტატუსი განახლდა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updatePartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "არასწორი პარტნიორის ID" });
      return;
    }

    // Check if user is admin or is updating their own profile
    if (req.user?.role !== ROLES.ADMIN && req.user?.id !== id) {
      res.status(403).json({ message: "წვდომა აკრძალულია" });
      return;
    }

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({ message: "პარტნიორი ვერ მოიძებნა" });
      return;
    }

    // Prevent non-admins from updating sensitive fields
    if (req.user?.role !== ROLES.ADMIN) {
      delete updateData.status;
      delete updateData.role;
      delete updateData.password;
    }

    const updatedPartner = await Organisation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json(updatedPartner);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deletePartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "არასწორი პარტნიორის ID" });
      return;
    }

    // Only the partner themselves can delete their account (admins don't need this on their side)
    if (req.user?.id !== id) {
      res.status(403).json({ message: "წვდომა აკრძალულია - მხოლოდ მფლობელს შეუძლია წაშლა" });
      return;
    }

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({ message: "პარტნიორი ვერ მოიძებნა" });
      return;
    }

    await partner.deleteOne();

    res.status(200).json({ message: "პარტნიორი წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
