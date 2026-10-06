import { TEMPLATES } from "./template";
import { CATEGORY } from "./categories";

const CURRENCY = "Rs."; 

export const formatPrice = (n) => `${CURRENCY} ${n.toLocaleString()}`;
export const formatTiers = (n) => `${n} Tier${n > 1 ? "s" : ""}`;
export const formatSizes = (sizes) => sizes.map((s) => `${s}"`).join(" / ");
export const formatPrep = ({ min, max }) =>
  min === max ? `${min} Hours` : `${min}–${max} Hours`;

export const getTemplateById = (id) => TEMPLATES.find((t) => t.id === id);

export const filterTemplates = (category, search = "") =>
  TEMPLATES.filter(
    (t) =>
      (category === CATEGORY.ALL || t.category === category) &&
      t.name.toLowerCase().includes(search.trim().toLowerCase())
  );