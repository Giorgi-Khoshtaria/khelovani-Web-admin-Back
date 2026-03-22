import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";

// GET /api/admin/translations
// Returns translations grouped by namespace and raw list
export const getTranslations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const translations = await Translation.find().lean();
    
    // Group by namespace for easy consumption
    const grouped: Record<string, Record<string, { ge: string; en: string }>> = {};
    
    translations.forEach((item: any) => {
      const ns = item.namespace;
      if (!grouped[ns]) {
        grouped[ns] = {};
      }
      grouped[ns][item.key] = item.translations;
    });

    res.status(200).json({
      success: true,
      data: {
        grouped,
        raw: translations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// GET /api/admin/namespaces
export const getNamespaces = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const namespaces = await Namespace.find().lean();
    res.status(200).json({ success: true, data: namespaces });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// POST /api/admin/translations
export const addTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { namespace, key, translations } = req.body;

    if (!namespace || !key || !translations || !translations.ge || !translations.en) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    // Verify namespace exists
    const nsExists = await Namespace.findById(namespace);
    if (!nsExists) {
      res.status(404).json({ success: false, message: `Namespace '${namespace}' not found` });
      return;
    }

    // Check if key already exists in this namespace
    const existing = await Translation.findOne({ namespace, key });
    if (existing) {
      res.status(400).json({ success: false, message: "Translation key already exists in this namespace" });
      return;
    }

    const newTranslation = await Translation.create({
      namespace,
      key,
      translations,
    });

    res.status(201).json({ success: true, data: newTranslation });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// PUT /api/admin/translations/:id
export const updateTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { translations } = req.body;

    if (!translations || (!translations.ge && !translations.en)) {
      res.status(400).json({ success: false, message: "At least one translation is required" });
      return;
    }

    const translation = await Translation.findById(id);
    if (!translation) {
      res.status(404).json({ success: false, message: "Translation not found" });
      return;
    }

    if (!translation.translations) {
      translation.translations = { ge: "", en: "" };
    }

    if (translations.ge) translation.translations.ge = translations.ge;
    if (translations.en) translation.translations.en = translations.en;

    await translation.save();

    res.status(200).json({ success: true, message: "Translation updated", data: translation });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
