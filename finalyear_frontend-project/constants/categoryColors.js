// components/src/constants/categoryColors.js

export const CATEGORY_COLORS = {
  Food: "#F97316",
  Transport: "#3B82F6",
  Rent: "#6366F1",
  Shopping: "#EC4899",
  Entertainment: "#8B5CF6",
  Health: "#10B981",
  Utilities: "#F59E0B",
  Education: "#14B8A6",
  Travel: "#06B6D4",
  Gifts: "#DB2777",
  Fitness: "#EF4444",
  Coffee: "#A16207",
  Drinks: "#D946EF",
  Snacks: "#F43F5E",
  Phone: "#3B82F6",
  Maintenance: "#6B7280",
  Delivery: "#84CC16",
  Beauty: "#EC4899",
  Social: "#8B5CF6",
  Groceries: "#84CC16",
  Other: "#6B7280",
};

const FALLBACK_COLORS = [
  "#F97316",
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#14B8A6",
  "#6366F1",
];

export const getCategoryColor = (categoryName) => {
  if (!categoryName) {
    return CATEGORY_COLORS.Other;
  }

  if (CATEGORY_COLORS[categoryName]) {
    return CATEGORY_COLORS[categoryName];
  }

  // Stable fallback based on category name
  let hash = 0;

  for (let i = 0; i < categoryName.length; i++) {
    hash =
      (hash + categoryName.charCodeAt(i)) %
      FALLBACK_COLORS.length;
  }

  return FALLBACK_COLORS[hash];
};