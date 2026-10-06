import { CATEGORY } from "./categories";
import floral from "../assets/floral.jpg";
import chocolate from "../assets/chocolate.jpg";
import heart from "../assets/heart.jpg";
import royal from "../assets/royal.jpg";
import unicorn from "../assets/unicorn.jpg";
import cartoon from "../assets/cartoon.jpg";
import floralPreview from "../assets/preview.jpg";

export const TEMPLATES = [
  {
    id: "floral",
    name: "Floral Birthday Cake",
    category: CATEGORY.BIRTHDAY,
    popular: true,
    description:
      "A beautiful and elegant cake with fresh flowers and a special birthday message.",
    images: {
      thumb: floral,
      preview: floralPreview,
      gallery: [floralPreview, floral],   // thumbnails under the preview
    },
    tiers: 2,
    sizes: [6, 8, 10],                    // inches
    prepHours: { min: 3, max: 4 },
    includes: ["flowers", "message", "sprinkles", "fondant"],
    colors: ["pink", "blue", "lilac", "yellow"],
    basePrice: 1950,
  },
  {
    id: "chocolate",
    name: "Chocolate Drip Delight",
    category: CATEGORY.BIRTHDAY,
    popular: false,
    description:
      "Rich chocolate ganache drip finished with fresh strawberries and sprinkles.",
    images: { thumb: chocolate, preview: chocolate, gallery: [chocolate] },
    tiers: 1,
    sizes: [6, 8],
    prepHours: { min: 3, max: 3 },
    includes: ["drip", "message", "sprinkles"],
    colors: ["pink", "cream"],
    basePrice: 1750,
  },
  {
    id: "heart",
    name: "Heart Celebration",
    category: CATEGORY.ANNIVERSARY,
    popular: false,
    description: "A heart-shaped cake with piped rosettes and a loving message.",
    images: { thumb: heart, preview: heart, gallery: [heart] },
    tiers: 1,
    sizes: [6, 8],
    prepHours: { min: 3, max: 3 },
    includes: ["message", "flowers"],
    colors: ["pink", "cream", "lilac"],
    basePrice: 1850,
  },
  {
    id: "royal",
    name: "Royal Wedding Cake",
    category: CATEGORY.WEDDING,
    popular: false,
    description: "A tiered white wedding cake decorated with delicate sugar flowers.",
    images: { thumb: royal, preview: royal, gallery: [royal] },
    tiers: 2,
    sizes: [6, 8, 10],
    prepHours: { min: 24, max: 24 },
    includes: ["flowers", "fondant", "topper"],
    colors: ["cream", "pink"],
    basePrice: 8500,
  },
  {
    id: "unicorn",
    name: "Unicorn Dream",
    category: CATEGORY.KIDS,
    popular: false,
    description: "A magical unicorn cake with a golden horn and pastel flowers.",
    images: { thumb: unicorn, preview: unicorn, gallery: [unicorn] },
    tiers: 1,
    sizes: [6, 8],
    prepHours: { min: 4, max: 4 },
    includes: ["flowers", "sprinkles", "fondant", "topper"],
    colors: ["pink", "lilac", "blue"],
    basePrice: 2250,
  },
  {
    id: "cartoon",
    name: "Cartoon Fun",
    category: CATEGORY.KIDS,
    popular: false,
    description: "A colourful sprinkle cake topped with a friendly cartoon bear.",
    images: { thumb: cartoon, preview: cartoon, gallery: [cartoon] },
    tiers: 1,
    sizes: [6, 8],
    prepHours: { min: 4, max: 4 },
    includes: ["sprinkles", "fondant", "message"],
    colors: ["blue", "yellow"],
    basePrice: 2100,
  },
];
