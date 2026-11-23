import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { createInstance } from "i18next";
import { Platform } from "react-native";
import { initReactI18next } from "react-i18next";

// Translations (one object per language/namespace).
import deCommon from "../locales/de/common.json";
import deErrors from "../locales/de/errors.json";
import deValidation from "../locales/de/validation.json";
import deRecipes from "../locales/de/recipes.json";
import enCommon from "../locales/en/common.json";
import enErrors from "../locales/en/errors.json";
import enValidation from "../locales/en/validation.json";
import enRecipes from "../locales/en/recipes.json";
import esCommon from "../locales/es/common.json";
import esErrors from "../locales/es/errors.json";
import esValidation from "../locales/es/validation.json";
import esRecipes from "../locales/es/recipes.json";
import frCommon from "../locales/fr/common.json";
import frErrors from "../locales/fr/errors.json";
import frValidation from "../locales/fr/validation.json";
import frRecipes from "../locales/fr/recipes.json";

// Key used to persist the user's language choice.
const LANGUAGE_KEY = "@app_language";

// Supported languages. Add a new one by creating its locale files and adding
// an entry here (and importing its namespaces above).
export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Translation namespaces. Add a namespace by creating `<lang>/<ns>.json` for
// every language and adding it here (the validate:translations script checks
// that every language has the same keys).
export const NAMESPACES = [
  "common",
  "errors",
  "validation",
  "recipes",
] as const;

const resources = {
  en: {
    common: enCommon,
    errors: enErrors,
    validation: enValidation,
    recipes: enRecipes,
  },
  es: {
    common: esCommon,
    errors: esErrors,
    validation: esValidation,
    recipes: esRecipes,
  },
  fr: {
    common: frCommon,
    errors: frErrors,
    validation: frValidation,
    recipes: frRecipes,
  },
  de: {
    common: deCommon,
    errors: deErrors,
    validation: deValidation,
    recipes: deRecipes,
  },
};

function isSupportedLanguage(
  language: string | null | undefined,
): language is SupportedLanguage {
  return Boolean(
    language &&
    Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, language),
  );
}

function getDeviceLanguage(): SupportedLanguage {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return isSupportedLanguage(languageCode) ? languageCode : "en";
}

// Keep the web language deterministic during static rendering and hydration.
// The stored preference is restored after hydration in the root layout.
const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      if (Platform.OS === "web") {
        callback("en");
        return;
      }

      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(isSupportedLanguage(savedLanguage) ? savedLanguage : "en");
        return;
      }

      callback(getDeviceLanguage());
    } catch (error) {
      console.error("Error detecting language:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      if (Platform?.OS === "web" && typeof window === "undefined") return;
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },
};

const i18n = createInstance();

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: [...NAMESPACES],
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    pluralSeparator: "_",
    debug: false,
    react: {
      useSuspense: false, // Suspense has rough edges in React Native
    },
    detection: {
      order: ["languageDetector"],
      caches: ["languageDetector"],
    },
  });

export async function initializeLanguagePreference(): Promise<void> {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    const preferredLanguage = isSupportedLanguage(savedLanguage)
      ? savedLanguage
      : getDeviceLanguage();

    if (preferredLanguage !== i18n.language) {
      await i18n.changeLanguage(preferredLanguage);
    }
  } catch (error) {
    console.error("Error restoring language preference:", error);
  }
}

export { i18n };
