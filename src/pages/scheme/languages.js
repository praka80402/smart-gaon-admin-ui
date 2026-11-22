export const DEFAULT_LANGUAGE = "EN";

export const LANGUAGES = [
  { code: "EN", label: "English", nativeLabel: "English" },
  { code: "HI", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "MR", label: "Marathi", nativeLabel: "मराठी" },
];

export const TRANSLATABLE_FIELDS = ["title", "detail", "benefits", "eligibility"];

export const emptyContent = () => ({
  title: "",
  detail: "",
  benefits: "",
  eligibility: "",
});

// { EN: {...}, HI: {...}, MR: {...} }
export const emptyContentForAllLanguages = () =>
  Object.fromEntries(LANGUAGES.map((l) => [l.code, emptyContent()]));

export const getLanguage = (code) =>
  LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

const pick = (translated, fallback) =>
  translated && String(translated).trim() ? translated : fallback;

// Scheme text in a given language, falling back to English per field.
export const getSchemeContent = (scheme, lang) => {
  const en = {
    title: scheme?.title || "",
    detail: scheme?.detail || "",
    benefits: scheme?.benefits || "",
    eligibility: scheme?.eligibility || "",
  };
  if (!scheme || lang === DEFAULT_LANGUAGE) return en;

  const tr = scheme.translations?.[lang];
  if (!tr) return en;

  return {
    title: pick(tr.title, en.title),
    detail: pick(tr.detail, en.detail),
    benefits: pick(tr.benefits, en.benefits),
    eligibility: pick(tr.eligibility, en.eligibility),
  };
};

// Has this scheme been written/translated in the given language?
export const schemeHasLanguage = (scheme, lang) =>
  lang === DEFAULT_LANGUAGE
    ? Boolean(scheme?.title?.trim())
    : Boolean(scheme?.translations?.[lang]?.title?.trim());

// Category name in a given language, falling back to English.
export const getCategoryName = (category, lang) => {
  if (!category) return "";
  if (lang === DEFAULT_LANGUAGE) return category.name;
  return pick(category.nameTranslations?.[lang], category.name);
};
