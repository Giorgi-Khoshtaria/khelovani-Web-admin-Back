export type Lang = "ge" | "en";

export interface TranslationMap {
  [key: string]: string;
}

export interface NamespacedTranslations {
  [namespace: string]: TranslationMap;
}
