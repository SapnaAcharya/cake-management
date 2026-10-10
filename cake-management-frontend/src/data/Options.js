import { getImageUrl } from "../utils/imageUrl";

// /* ---- Sizes (inches). `extra` is added to the template's starting price ---- */
export const SIZES = [
  { value: 6, extra: 0 },
  { value: 8, extra: 350 },
  { value: 10, extra: 800 },
  { value: 12, extra: 1400 },
];

export const EXTRA_TIER_PRICE = 900;

export const MAX_PRICE = 2;

export const MAX_CANDLES = 12;
export const MAX_MESSAGE_LENGTH = 100;

export const TIERS = [
  { value: 1, label: "1 Tier"},
  { value: 2, label: "2 Tiers"},
  { value: 3, label: "3 Tiers"}
];

export const COLOR_TINTS = {
  pink: "none",
  blue: "hue-rotate(185deg) saturate(1.1)",
  lilac: "hue-rotate(-65deg) saturate(0.9)",
  yellow: "hue-rotate(50deg) saturate(1.2)",
  cream: "saturate(0.35) brightness(1.05)",
};

export const FLAVORS = [
  { id: "vanilla", label: "Vanilla", dot: "#f4dfa8", extra: 0 },
  { id: "chocolate", label: "Chocolate", dot: "#4a2a1e", extra: 0 },
  { id: "red-velvet", label: "Red Velvet", dot: "#e11d2e", extra: 150 },
  { id: "strawberry", label: "Strawberry", dot: "#ff8fa8", extra: 100 },
];

export const FLAVOR_TINTS = {
  vanilla: "none",
  chocolate: "sepia(0.55) saturate(0.7) brightness(0.72)",
  "red-velvet": "hue-rotate(-18deg) saturate(1.5) brightness(0.85)",
  strawberry: "saturate(1.15) brightness(1.03)",
};

export const FROSTING_TINTS = {
  buttercream:"brightness(1.05) saturate(1.1)",
  "whipped-cream": "brightness(1.06) saturate(0.9)",
  fondant:         "saturate(0.7) contrast(1.08) brightness(1.03)",
  ganache:         "sepia(0.35) saturate(1.3) brightness(0.8) hue-rotate(-8deg)",
};

// /* ---- Frostings ---- */
export const FROSTINGS = [
  { id: "buttercream", label: "Buttercream", extra: 0 },
  { id: "whipped-cream", label: "Whipped Cream", extra: 0 },
  { id: "fondant", label: "Fondant", extra: 300 },
  { id: "ganache", label: "Ganache", extra: 200 },
];

export const FONT_STYLES = [
  { id: "script", label: "Script", family: '"Pacifico", cursive' },
  { id: "round", label: "Round", family: '"Fredoka", sans-serif' },
  { id: "classic", label: "Classic", family: '"Playfair Display", serif' },

  // Elegant
  { id: "great-vibes", label: "Great Vibes", family: '"Great Vibes", cursive' },
  { id: "dancing-script", label: "Dancing Script", family: '"Dancing Script", cursive' },

  // Modern
  { id: "poppins", label: "Poppins", family: '"Poppins", sans-serif' },
  { id: "montserrat", label: "Montserrat", family: '"Montserrat", sans-serif' },

  // Formal
  { id: "merriweather", label: "Merriweather", family: '"Merriweather", serif' },
  { id: "cinzel", label: "Cinzel", family: '"Cinzel", serif' },

  // Fun / Birthday
  { id: "lobster", label: "Lobster", family: '"Lobster", cursive' },
  { id: "chewy", label: "Chewy", family: '"Chewy", cursive' },

  // Handwritten
  { id: "satisfy", label: "Satisfy", family: '"Satisfy", cursive' },
  { id: "caveat", label: "Caveat", family: '"Caveat", cursive' },
];

export const OVERLAY_POSITIONS = {
  Flowers:   { x: 52, y: 33, w: 16 },
  Sprinkles: { x: 53, y: 32, w: 14 },
  Pearls:    { x: 53, y: 34, w: 15 },
  Macarons:  { x: 53, y: 33, w: 20 },
  Rose:      { x: 62, y: 24, w: 14 },
};
export const DEFAULT_OVERLAY_POSITION = { x: 50, y: 25, w: 30 };

export const DECORATION_CATEGORY_ORDER = ["Flowers", "Sprinkles", "Pearls", "Macarons", "Rose"];

export function initialConfig(template, initialColorId) {
  const colors = template?.colors ?? [];
  const chosen = colors.find((c) => c.id === initialColorId) ?? colors[0];

  return {
    message: "",
    font: FONT_STYLES[0].id,
    colorId: chosen?.id ?? "pink",
    colorDbId: chosen?.dbId ?? null,
    colorHex: chosen?.hex ?? "#ff5c8a",
    size: template?.sizes?.[0] ?? SIZES[0].value,
    tier: template?.tiers ?? 1,
    flavor: FLAVORS[0].id,
    frosting: FROSTINGS[0].id,
    decorations: [],
    candles: 0,
    lit: false,
  };
}

export function candlePositions(count) {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return { x: 30 + t * 40, y: 16 - Math.sin(t * Math.PI) * 4 };
  });
}

export function calcPrice(template, cfg, decorations = []) {
  const size = SIZES.find((s) => s.value === cfg.size);
  const lines = [
    { label: `Base Cake (${cfg.size}")`, amount: template.basePrice + (size?.extra ?? 0) },
  ];

  const extraTiers = Math.max(0, cfg.tier - template.tiers);
  if (extraTiers > 0) {
    lines.push({ label: `Extra tiers (${extraTiers})`, amount: extraTiers * EXTRA_TIER_PRICE });
  }

  const flavor = FLAVORS.find((f) => f.id === cfg.flavor);
  if (flavor?.extra) lines.push({ label: `${flavor.label} sponge`, amount: flavor.extra });

  const frosting = FROSTINGS.find((f) => f.id === cfg.frosting);
  if (frosting?.extra) lines.push({ label: `${frosting.label} frosting`, amount: frosting.extra });

  const decos = decorations.filter((d) => cfg.decorations.includes(d.id));
  if (decos.length) {
    lines.push({
      label: `Decorations (${decos.map((d) => d.name).join(" + ")})`,
      amount: decos.reduce((sum, d) => sum + Number(d.price), 0),
    });
  }

  if (cfg.candles > 0) lines.push({ label: `Candles (${cfg.candles})`, amount: cfg.candles * 2 });

  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

export function stageView(template, cfg, baseline, decorations = []) {
  const img = template.images;

  const tierPhotos = img.tiers?.[cfg.tier];
  const variant = img.variants?.[cfg.flavor];
  const hasVariantPhotos = !!variant?.length;

  const gallery = tierPhotos?.length
    ? tierPhotos
    : hasVariantPhotos
      ? variant
      : img.gallery?.length
        ? img.gallery
        : [img.preview];

  const useDrawnCake = cfg.tier !== template.tiers && !tierPhotos?.length;

  const tierNote = useDrawnCake
    ? `Illustration · your ${cfg.tier}-tier cake (original design has ${template.tiers} tier${template.tiers === 1 ? "" : "s"})`
    : "";

  const minSize = SIZES[0].value;
  const maxSize = SIZES[SIZES.length - 1].value;
  const t = (cfg.size - minSize) / (maxSize - minSize || 1);
  const sizeScale = +(0.8 + 0.2 * t).toFixed(3);

  const parts = [
  COLOR_TINTS[cfg.colorId],
  hasVariantPhotos ? "none" : (FLAVOR_TINTS?.[cfg.flavor] ?? "none"),
  FROSTING_TINTS?.[cfg.frosting] ?? "none",
].filter((f) => f && f !== "none");

  return {
    gallery,
    useDrawnCake,
    tierNote,
    tint: parts.length ? parts.join(" ") : "none",
    sizeScale,
    overlays: decorations
      .filter(
        (d) => cfg.decorations.includes(d.id) && !template.includes.includes(d.id)
      )
      .map((d) => {
        const pos = OVERLAY_POSITIONS[d.category] || DEFAULT_OVERLAY_POSITION;
        return {
          id: d.id,
          overlay: getImageUrl(d.imageUrl),
          ...pos,
        };
      }),
    candles: candlePositions(cfg.candles),
    fontFamily: FONT_STYLES.find((f) => f.id === cfg.font)?.family,
  };
}