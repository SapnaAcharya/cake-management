export const CATEGORY = {
  ALL: "All",
  BIRTHDAY: "Birthday",
  WEDDING: "Wedding",
  KIDS: "Kids",
  ANNIVERSARY: "Anniversary",
  CHOCOLATE: "Chocolate",
  GRADUATION: "Graduation",
  FLORAL: "Floral",
  MACARON: "Macaron",
  OCEAN_THEME: "Ocean Theme",
  CARTOON: "Cartoon",
  RUSTIC: "Rustic",
  HEART_SHAPE: "Heart Shape",
  RAINBOW: "Rainbow",
  MINIMALIST: "Minimalist",
  FRUITS: "Fruits",
};

// Shown as pills; the rest go under the "More" dropdown
 const MAIN_CATEGORIES = [
  CATEGORY.ALL, CATEGORY.BIRTHDAY, CATEGORY.WEDDING, CATEGORY.KIDS,
];
export const MORE_CATEGORIES = [CATEGORY.ANNIVERSARY];

// Alias so existing code that imports CATEGORIES keeps working
export const CATEGORIES = MAIN_CATEGORIES;