import Translation from "../modules/translation.modules.js";
import { Lang } from "../types/lang.types.js";
import { TranslationNamespace } from "./translation.enum.js";

interface CacheStructure {
  [namespace: string]: {
    [key: string]: {
      ge: string;
      en: string;
    };
  };
}

let translationCache: CacheStructure = {};

/**
 * Loads or Refreshes the translation cache from the DB.
 */
export const loadTranslationCache = async (): Promise<void> => {
  try {
    const translations = await Translation.find().lean();
    const newCache: CacheStructure = {};

    translations.forEach((item: any) => {
      const ns = item.namespace;
      const key = item.key;

      if (!newCache[ns]) {
        newCache[ns] = {};
      }

      newCache[ns][key] = item.translations;
    });

    translationCache = newCache;
    console.log("[Translation] Cache loaded successfully");
  } catch (error) {
    console.error("[Translation] Failed to load cache:", error);
  }
};

/**
 * Fetches a translated string.
 * Falls back to 'ge' then the key itself if no match is found.
 */
export const getTranslation = (
  namespace: TranslationNamespace,
  key: string,
  lang: Lang = "ge",
): string => {
  const item = translationCache[namespace]?.[key];
  if (!item) return key; // Fallback to key

  return item[lang] || item["ge"] || key;
};
