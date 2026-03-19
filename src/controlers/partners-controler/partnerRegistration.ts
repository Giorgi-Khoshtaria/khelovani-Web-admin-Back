import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerRegisterData } from "../../utils/types/partnerTypes.js";
import { validatePartnerRegistration } from "../../utils/validations/forms/partnerValidation.js";

export const registerPartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data: PartnerRegisterData = req.body;

    // ── Validate all fields ────────────────────────────────────────────────
    const validationErrors = validatePartnerRegistration(data);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Check for duplicate Organisation ──────────────────────────────────
    const existingOrg = await Organisation.findOne({
      $or: [
        { email: data.email },
        { identificationCode: data.identificationCode },
      ],
    });

    if (existingOrg) {
      res.status(409).json({
        message:
          existingOrg.email === data.email
            ? "ამ ელ. ფოსტით ორგანიზაცია უკვე არსებობს"
            : "ამ საიდენტიფიკაციო კოდით ორგანიზაცია უკვე არსებობს",
      });
      return;
    }

    // ── Create Organisation ────────────────────────────────────────────────
    await Organisation.create({
      companyNameGe: data.companyNameGe.trim(),
      companyNameEn: data.companyNameEn.trim(),
      identificationCode: data.identificationCode.trim(),
      contactPerson: data.contactPerson.trim(),
      phone: data.phone.trim(),
      city: data.city.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      description: data.description?.trim(),
      status: "pending",
    });

    res.status(201).json({ message: "პარტნიორი წარმატებით დარეგისტრირდა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
