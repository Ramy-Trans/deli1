import type { LangCode } from "@/context/LanguageContext";

export interface LocalizedItem {
  name: string;
  nameAr?: string | null;
  nameFr?: string | null;
  nameDe?: string | null;
}

export interface LocalizedDescription {
  description?: string | null;
  descriptionAr?: string | null;
  descriptionFr?: string | null;
  descriptionDe?: string | null;
}

export function getLocalizedName(item: LocalizedItem, lang: LangCode): string {
  switch (lang) {
    case "ar": return item.nameAr || item.name;
    case "fr": return item.nameFr || item.name;
    case "de": return item.nameDe || item.name;
    default:   return item.name;
  }
}

export function getLocalizedDesc(item: LocalizedDescription, lang: LangCode): string {
  switch (lang) {
    case "ar": return item.descriptionAr || item.description || "";
    case "fr": return item.descriptionFr || item.description || "";
    case "de": return item.descriptionDe || item.description || "";
    default:   return item.description || "";
  }
}
