import { Request, Response } from "express";
import Item from "../../modules/item.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { validateAddItem } from "../../validations/forms/itemValidation.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const addItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    const partnerId = req.user?.id;
    if (!partnerId) {
      res.status(401).json({ message: tAuth("unauthorized") });
      return;
    }

    const partner = await Organisation.findById(partnerId);
    if (!partner) {
      res.status(404).json({ message: tAuth("partner_not_found") });
      return;
    }

    const data = req.body;

    // Convert stringified arrays and booleans from FormData
    const customParse = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val === "true" ? true : val === "false" ? false : val;
        }
      }
      return val;
    };

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
    data.customizable = customParse(data.customizable);
    data.isShown =
      data.isShown !== undefined ? customParse(data.isShown) : false;

    // Validate the parsed data
    const validationErrors = await validateAddItem(data, lang);
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

    const newItem = await Item.create({
      ...data,
      owner: partnerId,
      images,
    });

    res.status(201).json({
      message: tAlerts("item_added_successfully") || "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("ADD_ITEM_ERROR:", error);
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({ message: tAlerts("server_error") || (error as Error).message });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const partnerId = req.params.id;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const { search, category, partnerId: queryPartnerId } = req.query;

    let query: any = {};

    // Use partnerId from params (/:id/items) or query (?partnerId=...)
    const targetPartnerId = partnerId || queryPartnerId;

    if (targetPartnerId) {
      query.owner = targetPartnerId;
    } 
    // If no partnerId, and it's not an admin, filter by the logged-in user's items
    else if (userRole !== "admin") {
      query.owner = userId;
    }
    // If it's an admin and no partnerId, query remains empty {} to fetch all

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { titleGe: searchRegex },
        { titleEn: searchRegex },
        { descriptionGe: searchRegex },
        { descriptionEn: searchRegex },
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
};

export const getItemById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Role-based access check
    if (userRole !== "admin" && item.owner.toString() !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item details" });
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Authorization: Admin can delete any item, Partner only their own
    if (userRole !== "admin" && item.owner.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this item" });
      return;
    }

    // Delete images from Cloudinary if they exist
    if (item.images && item.images.length > 0) {
      const deletePromises = item.images.map(async (imageUrl: string) => {
        try {
          // Extract public_id from Cloudinary URL
          // Example: https://res.cloudinary.com/cloud/image/upload/v12345/folder/name.jpg
          const parts = imageUrl.split("/");
          const fileNameWithExt = parts.pop();
          const folderName = parts.pop();

          if (fileNameWithExt && folderName) {
            const publicId = `${folderName}/${fileNameWithExt.split(".")[0]}`;
            // @ts-ignore - cloudinary import is default
            const result = await (
              await import("../../utils/config/cloudinary.js")
            ).default.uploader.destroy(publicId);
            return result;
          }
        } catch (err) {
          console.error("Cloudinary delete error for:", imageUrl, err);
        }
      });
      await Promise.all(deletePromises);
    }

    await Item.deleteOne({ _id: itemId });

    res.status(200).json({ message: "ნივთი წარმატებით წაიშალა" });
  } catch (error) {
    console.error("DELETE_ITEM_ERROR:", error);
    res.status(500).json({ message: "შეცდომა ნივთის წაშლისას" });
  }
};

export const updateItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const { itemId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Authorization: owner can edit everything, admin can only toggle isShown
    const isOwner = item.owner.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const customParse = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val === "true" ? true : val === "false" ? false : val;
        }
      }
      return val;
    };

    // If role is admin, they can ONLY update isShown
    if (userRole === "admin") {
      const isShown = customParse(req.body.isShown);
      if (isShown === undefined) {
          res.status(400).json({ message: "isShown field is required" });
          return;
      }

      const updatedItem = await Item.findByIdAndUpdate(itemId, { isShown }, { new: true });
      res.status(200).json({
        message: tAlerts("item_updated_successfully") || "Item updated successfully",
        item: updatedItem,
      });
      return;
    }

    const data = req.body;
    const fieldsToParse = ["tagsGe", "tagsEn", "materialsGe", "materialsEn", "isOneOfAKind", "shippingAvailable", "customizable", "isShown"];
    const numericFields = ["price", "stockQuantity", "shippingPrice", "weight"];

    fieldsToParse.forEach(field => {
        if (data[field] !== undefined) data[field] = customParse(data[field]);
    });

    numericFields.forEach(field => {
        if (data[field] !== undefined) data[field] = Number(data[field]);
    });

    let updatedImages = item.images;
    if (req.files && "images" in req.files && (req.files as any).images.length > 0) {
      const imagesToDelete = item.images;
      const newImages = (req.files as any).images.map((file: any) => file.path);
      
      const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
      const deletePromises = imagesToDelete.map(async (imageUrl: string) => {
        try {
          const parts = imageUrl.split("/");
          const fileNameWithExt = parts.pop();
          const folderName = parts.pop();
          if (fileNameWithExt && folderName) {
            const publicId = `${folderName}/${fileNameWithExt.split(".")[0]}`;
            // @ts-ignore
            return await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      });
      await Promise.all(deletePromises);
      updatedImages = newImages;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { ...data, images: updatedImages },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: tAlerts("item_updated_successfully") || "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("UPDATE_ITEM_ERROR:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};
