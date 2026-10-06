// utils/mapApiTemplate.js

export function mapApiTemplateToViewModel(apiTemplate) {
  const images = apiTemplate.images ?? [];
  // const primary = images[0]; // no isPrimary flag on the model, so just use the first uploaded image

  const thumb = images.find((img) => img.imageType === "thumb");
  const preview = images.find((img) => img.imageType === "preview");
  const galleryImages = images.filter((img) => img.imageType === "gallery");

  // Group tier-specific images by tier count: { 2: [...], 3: [...] }
  const tierImages = images.reduce((acc, img) => {
    if (img.imageType === "tier" && img.tierCount != null && img.imageUrl) {
      (acc[img.tierCount] ??= []).push(img.imageUrl);
    }
    return acc;
  }, {});

  return {
    id: apiTemplate.id,
    name: apiTemplate.name,
    category: apiTemplate.category,
    popular: apiTemplate.isPopular,
    description: apiTemplate.description,
    basePrice: apiTemplate.basePrice,
    tiers: apiTemplate.tiers,

    prepHours: {
      min: apiTemplate.minPrepHours,
      max: apiTemplate.maxPrepHours,
    },

     images: {
      thumb: thumb?.imageUrl ?? images[0]?.imageUrl ?? null,
      preview: preview?.imageUrl ?? images[0]?.imageUrl ?? null,
      gallery: galleryImages.map((img) => img.imageUrl).filter(Boolean),
      tiers: tierImages, // { 2: [...], 3: [...] }
    },

    sizes: (apiTemplate.sizes ?? []).map((s) => s.sizeInInches),

    colors: (apiTemplate.colors ?? []).map((c) => ({
      id: String(c.colorName ?? "").toLowerCase(),
      dbId: c.id,
      label: c.colorName.charAt(0).toUpperCase() + c.colorName.slice(1),
      hex: c.colorHex,
    })),

    includes: (apiTemplate.features ?? []).map((f) => f.featureName),
  };
}