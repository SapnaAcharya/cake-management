// // utils/mapApiTemplate.js

// export function mapApiTemplateToViewModel(apiTemplate) {
//   const images = apiTemplate.images ?? [];
//   // const primary = images[0]; // no isPrimary flag on the model, so just use the first uploaded image

//   const thumb = images.find((img) => img.imageType === "thumb");
//   const preview = images.find((img) => img.imageType === "preview");
//   const galleryImages = images.filter((img) => img.imageType === "gallery");

//   // Group tier-specific images by tier count: { 2: [...], 3: [...] }
//   const tierImages = images.reduce((acc, img) => {
//     if (img.imageType === "tier" && img.tierCount != null && img.imageUrl) {
//       (acc[img.tierCount] ??= []).push(img.imageUrl);
//     }
//     return acc;
//   }, {});

//   return {
//     id: apiTemplate.id,
//     name: apiTemplate.name,
//     category: apiTemplate.category,
//     popular: apiTemplate.isPopular,
//     description: apiTemplate.description,
//     basePrice: apiTemplate.basePrice,
//     tiers: apiTemplate.tiers,

//     prepHours: {
//       min: apiTemplate.minPrepHours,
//       max: apiTemplate.maxPrepHours,
//     },

//      images: {
//       thumb: thumb?.imageUrl ?? images[0]?.imageUrl ?? null,
//       preview: preview?.imageUrl ?? images[0]?.imageUrl ?? null,
//       gallery: galleryImages.map((img) => img.imageUrl).filter(Boolean),
//       tiers: tierImages, // { 2: [...], 3: [...] }
//     },

//     sizes: (apiTemplate.sizes ?? []).map((s) => s.sizeInInches),

//     colors: (apiTemplate.colors ?? []).map((c) => ({
//       id: String(c.colorName ?? "").toLowerCase(),
//       dbId: c.id,
//       label: c.colorName.charAt(0).toUpperCase() + c.colorName.slice(1),
//       hex: c.colorHex,
//     })),

//     includes: (apiTemplate.features ?? []).map((f) => f.featureName),
//   };
// }

// utils/mapApiTemplate.js

export function mapApiTemplateToViewModel(apiTemplate) {
  const images = apiTemplate.images ?? [];

  const thumb = images.find((img) => img.imageType === "thumb");
  const preview = images.find((img) => img.imageType === "preview");
  const galleryImages = images.filter((img) => img.imageType === "gallery");

  // Group photos by tier count: { 1: [...], 2: [...], 3: [...] }
  // Any row with a tierCount counts (1-tier rows are preview/gallery now), except thumb,
  // which is only the small card image. Duplicate URLs are removed.
  const tierImages = images.reduce((acc, img) => {
    if (img.tierCount != null && img.imageUrl && img.imageType !== "thumb") {
      const list = (acc[Number(img.tierCount)] ??= []);
      if (!list.includes(img.imageUrl)) list.push(img.imageUrl);
    }
    return acc;
  }, {});

  const basePreview = preview?.imageUrl ?? images[0]?.imageUrl ?? null;

  // One main photo per tier count; falls back to the preview if a tier has none
  const tierMain = {
    1: tierImages[1]?.[0] ?? basePreview,
    2: tierImages[2]?.[0] ?? basePreview,
    3: tierImages[3]?.[0] ?? basePreview,
  };

  return {
    id: apiTemplate.id,
    name: apiTemplate.name,
    category: apiTemplate.category,
    popular: apiTemplate.isPopular,
    description: apiTemplate.description,
    basePrice: apiTemplate.basePrice,
    tiers: Number(apiTemplate.tiers) || 1,

    prepHours: {
      min: apiTemplate.minPrepHours,
      max: apiTemplate.maxPrepHours,
    },

    images: {
      thumb: thumb?.imageUrl ?? images[0]?.imageUrl ?? null,
      preview: basePreview,
      gallery: galleryImages.map((img) => img.imageUrl).filter(Boolean),
      tiers: tierImages, // all photos per tier: { 1: [...], 2: [...], 3: [...] }
      tierMain,          // one photo per tier: { 1: url, 2: url, 3: url }
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