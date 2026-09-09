import React from "react";
import {
  IconBirthdayCandlesCake,
  IconStrawberryShortcakeSlice,
  IconTieredWeddingRoyal,
  IconChocolateGanacheFudge,
  IconBentoPetiteCake,
  IconRedVelvetHeart,
  IconGourmetCupcakeSwirl,
  IconCheesecakeSlice,
  IconCelebrationSparklerCake,
  IconBotanicalFloralCake,
  IconTiramisuCoffeeCake,
  IconBabyShowerPastelCake,
  IconSingleMilestoneCandle,
  IconRollCakeRoulade,
  IconMacaronTowerConfection,
  IconAllCakesGrand,
  CAKE_ICONS_MAP,
  CakeIconProps,
} from "../components/CategoryCakeIcon";

export interface CategoryIconMeta {
  key: string;
  label: string;
  icon: React.ComponentType<CakeIconProps>;
  component: React.ComponentType<CakeIconProps>;
  color: string;
  accent: string;
  description?: string;
}

/**
 * Registry of 16 Curated Colourful Illustrated Cake & Patisserie Icons
 * Directly inspired by artisanal bakery icon sheets
 */
export const AVAILABLE_CATEGORY_ICONS: Record<string, CategoryIconMeta> = {
  // 1. Birthday & Celebrations
  BirthdayCandlesCake: {
    key: "BirthdayCandlesCake",
    label: "Birthday & Celebration",
    icon: IconBirthdayCandlesCake,
    component: IconBirthdayCandlesCake,
    color: "#FFF5F7",
    accent: "#E11D48",
    description: "Multi-tier celebration cake with frosting drips & 3 lit candles",
  },
  // 2. Royal Tiered Wedding
  TieredWeddingRoyal: {
    key: "TieredWeddingRoyal",
    label: "Wedding & Tiered Royalty",
    icon: IconTieredWeddingRoyal,
    component: IconTieredWeddingRoyal,
    color: "#FDFBF7",
    accent: "#B88E3E",
    description: "Opulent 3-tier grand cake on a golden royal pedestal",
  },
  // 3. Romantic Heart Velvet
  RedVelvetHeart: {
    key: "RedVelvetHeart",
    label: "Anniversary & Romance",
    icon: IconRedVelvetHeart,
    component: IconRedVelvetHeart,
    color: "#FFF5F5",
    accent: "#BE123C",
    description: "Romantic scarlet heart-shaped gateau with delicate lace rosettes",
  },
  // 4. Belgian Chocolate Ganache
  ChocolateGanacheFudge: {
    key: "ChocolateGanacheFudge",
    label: "Belgian Chocolate & Truffle",
    icon: IconChocolateGanacheFudge,
    component: IconChocolateGanacheFudge,
    color: "#F7F2EC",
    accent: "#6B4423",
    description: "Dark chocolate wedge with glossy cocoa dripping and ruby cherry",
  },
  // 5. Korean Bento & Petite
  BentoPetiteCake: {
    key: "BentoPetiteCake",
    label: "Bento & Petite Cakes",
    icon: IconBentoPetiteCake,
    component: IconBentoPetiteCake,
    color: "#F5F8FA",
    accent: "#334155",
    description: "Cute Korean 2D bento cake with sunny-egg topper & piping",
  },
  // 6. Botanical & Floral
  BotanicalFloralCake: {
    key: "BotanicalFloralCake",
    label: "Botanical & Floral",
    icon: IconBotanicalFloralCake,
    component: IconBotanicalFloralCake,
    color: "#F4FAF3",
    accent: "#15803D",
    description: "Sage-cream celebration cake with hand-piped blossom petals",
  },
  // 7. Strawberry Shortcake
  StrawberryShortcakeSlice: {
    key: "StrawberryShortcakeSlice",
    label: "Strawberry & Berry Gateau",
    icon: IconStrawberryShortcakeSlice,
    component: IconStrawberryShortcakeSlice,
    color: "#FFF7F7",
    accent: "#E11D48",
    description: "Layered vanilla sponge slice with whole ruby strawberry",
  },
  // 8. Gourmet Cupcake Swirl
  GourmetCupcakeSwirl: {
    key: "GourmetCupcakeSwirl",
    label: "Cupcakes & Mini Treats",
    icon: IconGourmetCupcakeSwirl,
    component: IconGourmetCupcakeSwirl,
    color: "#FFFDF0",
    accent: "#D97706",
    description: "Fluted cupcake with cloud frosting swirl and festive cherry",
  },
  // 9. Golden Cheesecake Slice
  CheesecakeSlice: {
    key: "CheesecakeSlice",
    label: "Cheesecakes & Tarts",
    icon: IconCheesecakeSlice,
    component: IconCheesecakeSlice,
    color: "#FEFBF0",
    accent: "#B45309",
    description: "Golden-baked cheesecake slice with biscuit crumb crust & coulis",
  },
  // 10. Celebration Sparkler & Confetti
  CelebrationSparklerCake: {
    key: "CelebrationSparklerCake",
    label: "Festival & Sparklers",
    icon: IconCelebrationSparklerCake,
    component: IconCelebrationSparklerCake,
    color: "#F0FDF9",
    accent: "#059669",
    description: "Double-tier festival cake with sparkling star fireworks",
  },
  // 11. Tiramisu & Coffee Gateau
  TiramisuCoffeeCake: {
    key: "TiramisuCoffeeCake",
    label: "Tiramisu & Coffee Tiers",
    icon: IconTiramisuCoffeeCake,
    component: IconTiramisuCoffeeCake,
    color: "#F8F5F0",
    accent: "#78350F",
    description: "Espresso ladyfinger layers with cocoa-dusted mascarpone",
  },
  // 12. Baby Shower Pastel Cloud
  BabyShowerPastelCake: {
    key: "BabyShowerPastelCake",
    label: "Baby Shower & Kids",
    icon: IconBabyShowerPastelCake,
    component: IconBabyShowerPastelCake,
    color: "#F0F9FF",
    accent: "#0284C7",
    description: "Soft baby pastel tiers with bunting flags & golden crown",
  },
  // 13. Single Milestone Candle
  SingleMilestoneCandle: {
    key: "SingleMilestoneCandle",
    label: "Milestone & Custom Age",
    icon: IconSingleMilestoneCandle,
    component: IconSingleMilestoneCandle,
    color: "#FDFBF7",
    accent: "#B88E3E",
    description: "Minimalist cake with tall artisan milestone candle and flame",
  },
  // 14. Japanese Roll Cake
  RollCakeRoulade: {
    key: "RollCakeRoulade",
    label: "Roll Cakes & Roulades",
    icon: IconRollCakeRoulade,
    component: IconRollCakeRoulade,
    color: "#FFFBEB",
    accent: "#D97706",
    description: "Swirled Japanese swiss roll slice with Chantilly berry center",
  },
  // 15. Macaron Tower Confection
  MacaronTowerConfection: {
    key: "MacaronTowerConfection",
    label: "French Macarons & Delights",
    icon: IconMacaronTowerConfection,
    component: IconMacaronTowerConfection,
    color: "#FAF5FF",
    accent: "#7E22CE",
    description: "Stacked pastel French macarons crowning a patisserie tier",
  },
  // 16. All Cakes Signature Grand Emblem
  AllCakesGrand: {
    key: "AllCakesGrand",
    label: "All Confections (Grand)",
    icon: IconAllCakesGrand,
    component: IconAllCakesGrand,
    color: "#FAF6F0",
    accent: "#B88E3E",
    description: "Opulent golden baker's celebration cake with sovereign star",
  },

  // Backward compatibility alias mappings for existing DB categories:
  PartyPopper: {
    key: "PartyPopper",
    label: "Birthday Cakes",
    icon: IconBirthdayCandlesCake,
    component: IconBirthdayCandlesCake,
    color: "#FFF5F7",
    accent: "#E11D48",
  },
  Crown: {
    key: "Crown",
    label: "Wedding & Tiered",
    icon: IconTieredWeddingRoyal,
    component: IconTieredWeddingRoyal,
    color: "#FDFBF7",
    accent: "#B88E3E",
  },
  Heart: {
    key: "Heart",
    label: "Anniversary & Romance",
    icon: IconRedVelvetHeart,
    component: IconRedVelvetHeart,
    color: "#FFF5F5",
    accent: "#BE123C",
  },
  Cookie: {
    key: "Cookie",
    label: "Pure Belgian Chocolate",
    icon: IconChocolateGanacheFudge,
    component: IconChocolateGanacheFudge,
    color: "#F7F2EC",
    accent: "#6B4423",
  },
  Flower2: {
    key: "Flower2",
    label: "Botanical & Floral",
    icon: IconBotanicalFloralCake,
    component: IconBotanicalFloralCake,
    color: "#F4FAF3",
    accent: "#15803D",
  },
  Shapes: {
    key: "Shapes",
    label: "Bento & Petite Cakes",
    icon: IconBentoPetiteCake,
    component: IconBentoPetiteCake,
    color: "#F5F8FA",
    accent: "#334155",
  },
  Palette: {
    key: "Palette",
    label: "Custom Theme Cakes",
    icon: IconStrawberryShortcakeSlice,
    component: IconStrawberryShortcakeSlice,
    color: "#FFF7F7",
    accent: "#E11D48",
  },
  Cake: {
    key: "Cake",
    label: "Artisanal Cake",
    icon: IconAllCakesGrand,
    component: IconAllCakesGrand,
    color: "#FAF6F0",
    accent: "#B88E3E",
  },
  Gift: {
    key: "Gift",
    label: "Luxury Gifts",
    icon: IconMacaronTowerConfection,
    component: IconMacaronTowerConfection,
    color: "#FAF5FF",
    accent: "#7E22CE",
  },
  Flame: {
    key: "Flame",
    label: "Celebration Candle",
    icon: IconSingleMilestoneCandle,
    component: IconSingleMilestoneCandle,
    color: "#FDFBF7",
    accent: "#B88E3E",
  },
  Coffee: {
    key: "Coffee",
    label: "Tea Time Confection",
    icon: IconTiramisuCoffeeCake,
    component: IconTiramisuCoffeeCake,
    color: "#F8F5F0",
    accent: "#78350F",
  },
  Smile: {
    key: "Smile",
    label: "Kids Fun Cakes",
    icon: IconGourmetCupcakeSwirl,
    component: IconGourmetCupcakeSwirl,
    color: "#FFFDF0",
    accent: "#D97706",
  },
  Star: {
    key: "Star",
    label: "Masterpiece",
    icon: IconCelebrationSparklerCake,
    component: IconCelebrationSparklerCake,
    color: "#F0FDF9",
    accent: "#059669",
  },
  Baby: {
    key: "Baby",
    label: "Baby Shower",
    icon: IconBabyShowerPastelCake,
    component: IconBabyShowerPastelCake,
    color: "#F0F9FF",
    accent: "#0284C7",
  },
  GlassWater: {
    key: "GlassWater",
    label: "Cocktail Party",
    icon: IconCheesecakeSlice,
    component: IconCheesecakeSlice,
    color: "#FEFBF0",
    accent: "#B45309",
  },
  Sparkles: {
    key: "Sparkles",
    label: "Haute Specials",
    icon: IconCelebrationSparklerCake,
    component: IconCelebrationSparklerCake,
    color: "#F0FDF9",
    accent: "#059669",
  },
};

export const COLOR_PRESETS = [
  { label: "Champagne Gold", color: "#FAF6F0", accent: "#B88E3E" },
  { label: "Rose Blush", color: "#FFF5F7", accent: "#E11D48" },
  { label: "Scarlet Romance", color: "#FFF5F5", accent: "#BE123C" },
  { label: "Belgian Cocoa", color: "#F7F2EC", accent: "#6B4423" },
  { label: "Botanical Sage", color: "#F4FAF3", accent: "#15803D" },
  { label: "Slate Minimal", color: "#F5F8FA", accent: "#334155" },
  { label: "Sky Azure", color: "#F0F9FF", accent: "#0284C7" },
  { label: "Golden Honey", color: "#FEFBF0", accent: "#B45309" },
  { label: "Emerald Sparkle", color: "#F0FDF9", accent: "#059669" },
  { label: "Lavender Dream", color: "#FAF5FF", accent: "#7E22CE" },
];

export function getCategoryIconMeta(iconKey?: string): CategoryIconMeta {
  if (iconKey && AVAILABLE_CATEGORY_ICONS[iconKey]) {
    return AVAILABLE_CATEGORY_ICONS[iconKey];
  }
  return AVAILABLE_CATEGORY_ICONS["AllCakesGrand"];
}

export { CAKE_ICONS_MAP };
