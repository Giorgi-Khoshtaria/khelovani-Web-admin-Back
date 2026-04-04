import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { validateAddProduct } from "../../validations/forms/productValidation.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { customParse } from "./product.utils.js";

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

    // If paramPartnerId is provided (e.g. /admin/partners/:id/products), use it as owner
    // But only if requester is admin. Otherwise, use requester's own ID.
    const partnerId = isAdmin && paramPartnerId ? paramPartnerId : userId;

    const partner = await Organisation.findById(partnerId);
    if (!partner) {
      res.status(404).json({ message: tAuth("partner_not_found") });
      return;
    }

    const data = req.body;

    data.tagsGe = customParse(data.tagsGe) || [];
    data.tagsEn = customParse(data.tagsEn) || [];
    data.materialsGe = customParse(data.materialsGe) || [];
    data.materialsEn = customParse(data.materialsEn) || [];
    data.price = Number(data.price);
    data.stockQuantity = Number(data.stockQuantity);
    data.shippingPrice = data.shippingPrice
      ? Number(data.shippingPrice)
      : undefined;
    data.weight = data.weight ? Number(data.weight) : undefined;
    data.isOneOfAKind = customParse(data.isOneOfAKind);
    data.shippingAvailable = customParse(data.shippingAvailable);
    data.isShown =
      data.isShown !== undefined ? customParse(data.isShown) : false;

    // Validate the parsed data
    const validationErrors = await validateAddProduct(data, lang);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // Handle Uploaded Files
    if (
      !req.files ||
      !("images" in req.files) ||
      (req.files as any).images.length === 0
    ) {
      res.status(400).json({ message: "Images are required" });
      return;
    }

    const images = (req.files as any).images.map((file: any) => file.path);

    const newProduct = await Product.create({
      ...data,
      owner: partnerId,
      images,
    });

    res.status(201).json({
      message:
        tAlerts("product_added_successfully") || "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("ADD_PRODUCT_ERROR:", error);
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
