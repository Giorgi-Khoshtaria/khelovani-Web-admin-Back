import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { customParse } from "./product.utils.js";

import mongoose from "mongoose";

// @desc    Add a product
// @route   POST /api/products
// @access  Private Partner/Admin
export const addProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    const { id: paramPartnerId } = req.params;
    const userRole = req.user?.role?.toLowerCase();
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: tAuth("unauthorized") });
      return;
    }

    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin" ||
      req.user?.permissions?.includes("products.create");

    if (paramPartnerId && paramPartnerId !== userId && !isAdmin) {
      res.status(403).json({ message: "Forbidden: cannot create product for another partner" });
      return;
    }

    // If paramPartnerId is provided (e.g. /admin/partners/:id/products), use it as owner
    // But only if requester is admin. Otherwise, use requester's own ID.
    const partnerId = isAdmin && paramPartnerId ? paramPartnerId : userId;

    if (!mongoose.Types.ObjectId.isValid(partnerId as string)) {
      res.status(400).json({ message: "Invalid partner ID format" });
      return;
    }

    const partner = await Organisation.findById(partnerId as string);
    if (!partner) {
      res.status(404).json({ message: tAuth("partner_not_found") });
      return;
    }

    const data = req.body;

    // Handle Uploaded Files
    if (
      !req.files ||
      !("images" in req.files) ||
      (req.files as any).images.length === 0
    ) {
      res.status(422).json({ 
        errors: [{ field: "images", message: "images_required" }] 
      });
      return;
    }

    const images = (req.files as any).images.map((file: any) => file.path);

    const newProduct = await Product.create({
      ...data,
      owner: partnerId,
      images,
    });

    const finalProduct = await Product.findById(newProduct._id).select("-__v");

    res.status(201).json({
      message:
        tAlerts("product_added_successfully") || "Product added successfully",
      product: finalProduct,
    });
  } catch (error) {
    console.error("ADD_PRODUCT_ERROR:", error);
    if ((error as any).name === "ValidationError" || (error as any).name === "CastError") {
      const errorMsg = (error as Error).message;
      res.status(422).json({ 
        message: "Validation Error",
        errors: (error as any).errors ? Object.values((error as any).errors).map((err: any) => ({
          field: err.path,
          message: err.message,
        })) : [{ field: (error as any).path, message: errorMsg }]
      });
      return;
    }
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ 
      message: tAlerts("server_error") || (error as Error).message, 
      error: String(error) 
    });
  }
};
