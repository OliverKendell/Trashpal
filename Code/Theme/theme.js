// TrashPal Design System
// Earthy greens + clean whites + bold accent

export const colors = {
  // Primaries
  green: "#1a7a4a",
  greenLight: "#2ea866",
  greenDark: "#0f4d2e",
  greenPale: "#e8f5ee",

  // Bin colours (UK standard)
  recyclingBlue: "#2563eb",
  recyclingBluePale: "#eff6ff",
  generalGrey: "#6b7280",
  generalGreyPale: "#f3f4f6",
  gardenBrown: "#854d0e",
  gardenBrownPale: "#fef3c7",

  // Neutrals
  white: "#ffffff",
  offWhite: "#f9fafb",
  border: "#e5e7eb",
  text: "#111827",
  textMuted: "#6b7280",
  textLight: "#9ca3af",

  // Status
  success: "#16a34a",
  successPale: "#dcfce7",
  danger: "#dc2626",
  dangerPale: "#fee2e2",
  warning: "#d97706",
  warningPale: "#fef3c7",
};

export const fonts = {
  regular: "System",
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const BIN_TYPES = {
  RECYCLING: {
    label: "Recycling",
    color: colors.recyclingBlue,
    paleColor: colors.recyclingBluePale,
    emoji: "♻️",
    icon: "🔵",
    description: "Blue bin — paper, cardboard, glass, cans, plastic bottles",
  },
  GENERAL: {
    label: "General Waste",
    color: colors.generalGrey,
    paleColor: colors.generalGreyPale,
    emoji: "🗑️",
    icon: "⚫",
    description: "Black bin — non-recyclable household waste",
  },
  GARDEN: {
    label: "Garden Waste",
    color: colors.gardenBrown,
    paleColor: colors.gardenBrownPale,
    emoji: "🌿",
    icon: "🟤",
    description: "Brown bin — grass, leaves, plants, small branches",
  },
};
