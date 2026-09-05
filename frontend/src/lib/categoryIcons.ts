import {
  Cake,
  PartyPopper,
  Heart,
  Cookie,
  Flower2,
  Crown,
  Shapes,
  Baby,
  Palette,
  Sparkles,
  Gift,
  Flame,
  Coffee,
  Smile,
  Star,
  GlassWater,
  LucideIcon,
} from "lucide-react";

export interface CategoryIconMeta {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  accent: string;
}

export const AVAILABLE_CATEGORY_ICONS: Record<string, CategoryIconMeta> = {
  Cake: {
    key: "Cake",
    label: "Artisanal Cake",
    icon: Cake,
    color: "#FAF6F0",
    accent: "#B88E3E",
  },
  PartyPopper: {
    key: "PartyPopper",
    label: "Birthday & Party",
    icon: PartyPopper,
    color: "#FFF5F7",
    accent: "#E11D48",
  },
  Heart: {
    key: "Heart",
    label: "Anniversary & Love",
    icon: Heart,
    color: "#FFF9EE",
    accent: "#B88E3E",
  },
  Cookie: {
    key: "Cookie",
    label: "Chocolate & Cookies",
    icon: Cookie,
    color: "#F6F1EA",
    accent: "#6B4423",
  },
  Flower2: {
    key: "Flower2",
    label: "Botanical & Floral",
    icon: Flower2,
    color: "#FFF0F3",
    accent: "#DB2777",
  },
  Crown: {
    key: "Crown",
    label: "Tiered & Royal",
    icon: Crown,
    color: "#F9F9F9",
    accent: "#C89B3C",
  },
  Shapes: {
    key: "Shapes",
    label: "Modern Minimalist",
    icon: Shapes,
    color: "#F4F6F8",
    accent: "#475569",
  },
  Baby: {
    key: "Baby",
    label: "Baby Shower",
    icon: Baby,
    color: "#F0F9FF",
    accent: "#0284C7",
  },
  Palette: {
    key: "Palette",
    label: "Custom Bespoke",
    icon: Palette,
    color: "#FDF2EC",
    accent: "#EA580C",
  },
  Sparkles: {
    key: "Sparkles",
    label: "Haute Specials",
    icon: Sparkles,
    color: "#FEFCE8",
    accent: "#CA8A04",
  },
  Gift: {
    key: "Gift",
    label: "Luxury Gifts",
    icon: Gift,
    color: "#F0FDF4",
    accent: "#16A34A",
  },
  Flame: {
    key: "Flame",
    label: "Celebration Candle",
    icon: Flame,
    color: "#FFF7ED",
    accent: "#EA580C",
  },
  Coffee: {
    key: "Coffee",
    label: "Tea Time Confection",
    icon: Coffee,
    color: "#FDF6ED",
    accent: "#854D0E",
  },
  Smile: {
    key: "Smile",
    label: "Kids Fun Cakes",
    icon: Smile,
    color: "#FEF2F2",
    accent: "#EF4444",
  },
  Star: {
    key: "Star",
    label: "Masterpiece",
    icon: Star,
    color: "#FEF9C3",
    accent: "#A16207",
  },
  GlassWater: {
    key: "GlassWater",
    label: "Cocktail Party",
    icon: GlassWater,
    color: "#F5F3FF",
    accent: "#7C3AED",
  },
};

export const COLOR_PRESETS = [
  { label: "Champagne Gold", color: "#FAF6F0", accent: "#B88E3E" },
  { label: "Rose Blush", color: "#FFF5F7", accent: "#E11D48" },
  { label: "Velvet Blossom", color: "#FFF0F3", accent: "#DB2777" },
  { label: "Belgian Cocoa", color: "#F6F1EA", accent: "#6B4423" },
  { label: "Royal Ivory", color: "#F9F9F9", accent: "#C89B3C" },
  { label: "Slate Minimal", color: "#F4F6F8", accent: "#475569" },
  { label: "Sky Azure", color: "#F0F9FF", accent: "#0284C7" },
  { label: "Tangerine Sunset", color: "#FDF2EC", accent: "#EA580C" },
  { label: "Emerald Luxury", color: "#F0FDF4", accent: "#16A34A" },
  { label: "Lavender Dream", color: "#F5F3FF", accent: "#7C3AED" },
];

export function getCategoryIconMeta(iconKey?: string): CategoryIconMeta {
  if (iconKey && AVAILABLE_CATEGORY_ICONS[iconKey]) {
    return AVAILABLE_CATEGORY_ICONS[iconKey];
  }
  return AVAILABLE_CATEGORY_ICONS["Cake"];
}
