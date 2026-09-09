import React from "react";

export interface CakeIconProps {
  name?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 1. Birthday Celebration Cake (3 Lit Candles, Frosting Drips, Sprinkles)
 */
export function IconBirthdayCandlesCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Plate / Base Stand */}
      <ellipse cx="32" cy="56" rx="26" ry="4.5" fill="#E2D6C3" stroke="#2D2319" strokeWidth="2" />
      <path d="M14 55.5V57C14 59 22 60.5 32 60.5C42 60.5 50 59 50 57V55.5" fill="#C9BAA2" stroke="#2D2319" strokeWidth="2" />
      
      {/* Cake Base Sponge (Vanilla Amber) */}
      <rect x="14" y="32" width="36" height="24" rx="3" fill="#F8E5BA" stroke="#2D2319" strokeWidth="2" />
      
      {/* Filling Layer Stripe (Berry Jam) */}
      <rect x="14" y="43" width="36" height="4" fill="#E11D48" />
      
      {/* Top Frosting Layer (Blush Strawberry Pink) */}
      <path d="M14 32C14 28 18 26 32 26C46 26 50 28 50 32H14Z" fill="#FDA4AF" stroke="#2D2319" strokeWidth="2" />
      
      {/* Frosting Drips */}
      <path d="M14 32C15.5 37 17.5 37 19 32C20.5 38 23.5 38 25 32C26.5 36.5 29.5 36.5 31 32C32.5 38.5 35.5 38.5 37 32C38.5 36 41.5 36 43 32C44.5 38 47.5 38 49 32" fill="#FDA4AF" stroke="#2D2319" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Decorative Sprinkles */}
      <circle cx="21" cy="29" r="1.2" fill="#E11D48" />
      <circle cx="27" cy="30" r="1.2" fill="#059669" />
      <circle cx="34" cy="28.5" r="1.2" fill="#2563EB" />
      <circle cx="41" cy="29.5" r="1.2" fill="#F59E0B" />
      <circle cx="24" cy="49" r="1" fill="#E11D48" />
      <circle cx="39" cy="50" r="1" fill="#F59E0B" />

      {/* 3 Candles */}
      {/* Candle 1 (Left) */}
      <rect x="22" y="16" width="3.5" height="10" rx="1" fill="#60A5FA" stroke="#2D2319" strokeWidth="1.5" />
      <path d="M23.75 16V13.5" stroke="#2D2319" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23.75 8C22 10.5 22.5 12 23.75 13.5C25 12 25.5 10.5 23.75 8Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <circle cx="23.75" cy="11.5" r="1" fill="#FEF08A" />

      {/* Candle 2 (Center - Taller) */}
      <rect x="30.25" y="13" width="3.5" height="13" rx="1" fill="#F43F5E" stroke="#2D2319" strokeWidth="1.5" />
      <path d="M32 13V10.5" stroke="#2D2319" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 5C30 7.5 30.5 9 32 10.5C33.5 9 34 7.5 32 5Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <circle cx="32" cy="8.5" r="1.2" fill="#FEF08A" />

      {/* Candle 3 (Right) */}
      <rect x="38.5" y="16" width="3.5" height="10" rx="1" fill="#34D399" stroke="#2D2319" strokeWidth="1.5" />
      <path d="M40.25 16V13.5" stroke="#2D2319" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40.25 8C38.5 10.5 39 12 40.25 13.5C41.5 12 42 10.5 40.25 8Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <circle cx="40.25" cy="11.5" r="1" fill="#FEF08A" />
    </svg>
  );
}

/**
 * 2. Strawberry Shortcake Slice (Vanilla Sponge, Whipped Cream & Whole Ruby Strawberry)
 */
export function IconStrawberryShortcakeSlice({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Golden Crumb Crust Plate */}
      <ellipse cx="32" cy="56" rx="25" ry="4" fill="#F1ECE1" stroke="#2D2319" strokeWidth="1.75" />

      {/* Cake Slice Wedge (Isometric) */}
      {/* Front Face (Cut Layers) */}
      <path d="M12 48L36 53V31L12 26V48Z" fill="#FDF3DA" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Sponge Layers */}
      <path d="M12 33L36 38V41L12 36V33Z" fill="#E07A5F" />
      <path d="M12 42L36 47V49L12 44V42Z" fill="#E11D48" />
      
      {/* Cream Piping Infill */}
      <circle cx="17" cy="34.5" r="1.5" fill="#FFFFFF" />
      <circle cx="24" cy="36" r="1.5" fill="#FFFFFF" />
      <circle cx="31" cy="37.5" r="1.5" fill="#FFFFFF" />
      
      {/* Side Face (Back Slant) */}
      <path d="M36 53L54 39V17L36 31V53Z" fill="#FFFBF5" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Top Cream Slope */}
      <path d="M12 26L30 12L54 17L36 31L12 26Z" fill="#FFFFFF" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Whipped Cream Rosettes on Top */}
      <path d="M36 24C34 22 36 19 38 20C40 18 43 20 42 22C44 24 41 26 39 25C37 26 35 25 36 24Z" fill="#FFF1F2" stroke="#2D2319" strokeWidth="1.5" />
      
      {/* Fresh Whole Strawberry on Top */}
      <path d="M28 18C25 14 27 9 32 9C37 9 39 14 36 18C34 21 30 21 28 18Z" fill="#E11D48" stroke="#2D2319" strokeWidth="1.75" strokeLinejoin="round" />
      {/* Strawberry Seeds */}
      <circle cx="30" cy="13" r="0.7" fill="#FEF08A" />
      <circle cx="34" cy="14" r="0.7" fill="#FEF08A" />
      <circle cx="31" cy="17" r="0.7" fill="#FEF08A" />
      {/* Green Leaves Stem */}
      <path d="M30 9C29 6 32 6 32 7C33 5 35 6 34 8" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M29 9L31 10L33 9" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 3. Tiered Royal Wedding Cake (3 Opulent Tiers, Gold Pedestal Stand & Pearl Garland)
 */
export function IconTieredWeddingRoyal({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Golden Royal Pedestal Stand */}
      <path d="M24 58H40L36 53H28L24 58Z" fill="#D4AF37" stroke="#2D2319" strokeWidth="1.75" />
      <ellipse cx="32" cy="53" rx="22" ry="3.5" fill="#DFC27A" stroke="#2D2319" strokeWidth="2" />
      
      {/* Tier 1 (Bottom Grand Tier) */}
      <rect x="14" y="39" width="36" height="14" rx="2" fill="#FFFDF9" stroke="#2D2319" strokeWidth="2" />
      <path d="M14 43C17 46 21 46 24 43C27 46 31 46 34 43C37 46 41 46 44 43C47 46 50 45 50 43" stroke="#B88E3E" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="46" r="1" fill="#C59B27" />
      <circle cx="34" cy="46" r="1" fill="#C59B27" />
      <circle cx="44" cy="46" r="1" fill="#C59B27" />

      {/* Tier 2 (Middle Tier) */}
      <rect x="20" y="27" width="24" height="12" rx="2" fill="#FFFBF2" stroke="#2D2319" strokeWidth="2" />
      <path d="M20 31C22.5 33.5 25.5 33.5 28 31C30.5 33.5 33.5 33.5 36 31C38.5 33.5 41.5 33.5 44 31" stroke="#B88E3E" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="34" r="1" fill="#C59B27" />
      <circle cx="36" cy="34" r="1" fill="#C59B27" />

      {/* Tier 3 (Top Tier) */}
      <rect x="25" y="17" width="14" height="10" rx="1.5" fill="#FFFDF9" stroke="#2D2319" strokeWidth="2" />
      <path d="M25 20.5C27 22 29 22 31 20.5C33 22 35 22 37 20.5C38 21.5 39 21.5 39 20.5" stroke="#B88E3E" strokeWidth="1.25" strokeLinecap="round" />

      {/* Royal Crown / Double Heart Topper */}
      <path d="M30 11C28.5 9 27 11 29 13.5L32 16L35 13.5C37 11 35.5 9 34 11C33 8.5 31 8.5 30 11Z" fill="#E11D48" stroke="#2D2319" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="7" r="1.5" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 4. Pure Belgian Chocolate Ganache Fudge Slice
 */
export function IconChocolateGanacheFudge({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Plate */}
      <ellipse cx="32" cy="56" rx="25" ry="4" fill="#E8E2D8" stroke="#2D2319" strokeWidth="1.75" />

      {/* Chocolate Slice Front Face */}
      <path d="M12 48L36 53V31L12 26V48Z" fill="#5C3822" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Dark Truffle Cream Filling Stripes */}
      <path d="M12 33L36 38V40.5L12 35.5V33Z" fill="#382115" />
      <path d="M12 41.5L36 46.5V49L12 44V41.5Z" fill="#382115" />

      {/* Side Face - Glossy Cocoa Ganache */}
      <path d="M36 53L54 39V17L36 31V53Z" fill="#422518" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Top Glossy Melted Chocolate Glaze */}
      <path d="M12 26L30 12L54 17L36 31L12 26Z" fill="#2E170E" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Front Drip Effect */}
      <path d="M12 26C14 29 16 29 18 26C19.5 30 22.5 30 24 26C26 31 29 31 31 26C33 29 35 29 36 27" stroke="#2E170E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Whipped Vanilla Rosette */}
      <ellipse cx="36" cy="18" rx="5" ry="3.5" fill="#FFF9EE" stroke="#2D2319" strokeWidth="1.5" />

      {/* Ruby Cherry on Top */}
      <circle cx="36" cy="13" r="4.5" fill="#DC2626" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="34.5" cy="11.5" r="1.2" fill="#FCA5A5" />
      {/* Cherry Stem */}
      <path d="M36 9C37 5 42 5 44 8" stroke="#15803D" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 5. Bento Petite Cake (Korean Minimalist Pastel Cake with Sunny Egg / Daisy Topper)
 */
export function IconBentoPetiteCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Bento Craft Paper Box Liner */}
      <ellipse cx="32" cy="56" rx="24" ry="4" fill="#F4E8D6" stroke="#2D2319" strokeWidth="1.75" />
      <path d="M10 52C10 52 14 58 32 58C50 58 54 52 54 52" stroke="#2D2319" strokeWidth="2" strokeLinecap="round" />

      {/* Round Cake Cylinder */}
      <rect x="15" y="32" width="34" height="22" rx="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="2" />
      
      {/* Cartoon Black Piping Line Art (Korean 2D Style) */}
      <path d="M15 47C18 49.5 21 49.5 24 47C27 49.5 30 49.5 33 47C36 49.5 39 49.5 42 47C45 49.5 47 48.5 49 47" stroke="#2D2319" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="51" r="1.2" fill="#2D2319" />
      <circle cx="28" cy="51" r="1.2" fill="#2D2319" />
      <circle cx="36" cy="51" r="1.2" fill="#2D2319" />
      <circle cx="44" cy="51" r="1.2" fill="#2D2319" />

      {/* Top Ellipse Surface */}
      <ellipse cx="32" cy="32" rx="17" ry="6" fill="#FFFFFF" stroke="#2D2319" strokeWidth="2" />

      {/* Scalloped Cream Border on Top */}
      <path d="M15 32C17 35 20 35 22 32C24 35 27 35 29 32C31 35 34 35 36 32C38 35 41 35 43 32C45 35 47 34 49 32" stroke="#2D2319" strokeWidth="1.5" strokeLinecap="round" />

      {/* Signature Sunny-Egg Topper */}
      <ellipse cx="33" cy="27" rx="7.5" ry="4.5" fill="#FEFCE8" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="33" cy="26" r="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
      <circle cx="32" cy="25" r="0.8" fill="#FFFFFF" />

      {/* Tiny Bento Hearts */}
      <path d="M22 25C21 24 20 25 21 26.5L22 27.5L23 26.5C24 25 23 24 22 25Z" fill="#F43F5E" />
      <path d="M41 27C40 26 39 27 40 28.5L41 29.5L42 28.5C43 27 42 26 41 27Z" fill="#F43F5E" />
    </svg>
  );
}

/**
 * 6. Red Velvet Heart Cake (Romantic Heart Gateau with Delicate Lace Rosettes)
 */
export function IconRedVelvetHeart({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Gold Scalloped Cardboard Base */}
      <ellipse cx="32" cy="56" rx="25" ry="4.5" fill="#D4AF37" stroke="#2D2319" strokeWidth="2" />

      {/* Heart Cake 3D Body */}
      <path
        d="M13 32C10 21 23 15 32 24C41 15 54 21 51 32C47 44 32 54 32 54C32 54 17 44 13 32Z"
        fill="#BE123C"
        stroke="#2D2319"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Velvet Crimson Shadow Gradient Accent */}
      <path
        d="M14 34C17 44 32 53 32 53C32 53 47 44 50 34C48 40 32 49 32 49C32 49 16 40 14 34Z"
        fill="#881337"
      />

      {/* Delicate White Lace Piping Pearls around Heart */}
      <path
        d="M17 31C15 23 24 19 32 25C40 19 49 23 47 31C44 40 32 49 32 49C32 49 20 40 17 31Z"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 3"
      />

      {/* Bouquet of White Vanilla Cream Rosettes (Top Left) */}
      <circle cx="23" cy="24" r="3.5" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.25" />
      <circle cx="28" cy="23" r="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.25" />
      <circle cx="24" cy="29" r="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.25" />
      <circle cx="20" cy="27" r="2" fill="#FFF1F2" />

      {/* Edible Silver Pearls */}
      <circle cx="36" cy="33" r="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="41" cy="28" r="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="34" cy="41" r="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="41" cy="38" r="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * 7. Gourmet Cupcake with Whipped Cream Swirl & Cherry
 */
export function IconGourmetCupcakeSwirl({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Cupcake Liner Base (Pleated Fluted Cup) */}
      <path d="M19 36L23 57H41L45 36H19Z" fill="#FDE68A" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      {/* Liner Pleat Folds */}
      <path d="M23 36L26 57" stroke="#D97706" strokeWidth="1.5" />
      <path d="M28 36L30 57" stroke="#D97706" strokeWidth="1.5" />
      <path d="M33 36L34 57" stroke="#D97706" strokeWidth="1.5" />
      <path d="M38 36L38 57" stroke="#D97706" strokeWidth="1.5" />
      <path d="M42 36L40 57" stroke="#D97706" strokeWidth="1.5" />

      {/* Sponge Muffin Dome */}
      <path d="M17 36C15 32 20 29 25 30C28 27 34 27 37 30C41 28 47 31 46 36H17Z" fill="#C28A4E" stroke="#2D2319" strokeWidth="2" />

      {/* Whipped Frosting Swirl (Voluminous Cloud) */}
      <path
        d="M17 34C15 30 18 26 23 27C24 23 29 21 34 22C38 18 45 20 45 25C48 26 50 30 47 34C44 36 20 36 17 34Z"
        fill="#FFF5F7"
        stroke="#2D2319"
        strokeWidth="2"
      />
      {/* Middle Swirl Layer */}
      <path
        d="M21 26C20 22 25 18 29 19C32 15 39 16 40 20C43 21 44 24 41 26C38 27 24 27 21 26Z"
        fill="#FDE8EC"
        stroke="#2D2319"
        strokeWidth="1.75"
      />
      {/* Swirl Crown Peak */}
      <path
        d="M27 18C28 14 34 13 36 16C38 15 39 17 37 19C34 20 29 19 27 18Z"
        fill="#FFFFFF"
        stroke="#2D2319"
        strokeWidth="1.5"
      />

      {/* Colorful Nonpareils / Sprinkles */}
      <circle cx="24" cy="30" r="1" fill="#E11D48" />
      <circle cx="31" cy="27" r="1" fill="#2563EB" />
      <circle cx="38" cy="29" r="1" fill="#059669" />
      <circle cx="34" cy="23" r="1" fill="#F59E0B" />

      {/* Cherry on Top */}
      <circle cx="34" cy="11" r="4.5" fill="#E11D48" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="32.5" cy="9.5" r="1" fill="#FECDD3" />
      <path d="M34 7C35 3 40 3 42 6" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 8. Golden Cheesecake Slice (Graham Cracker Crust with Blueberry / Strawberry Topping)
 */
export function IconCheesecakeSlice({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Ceramic Plate */}
      <ellipse cx="32" cy="56" rx="25" ry="4" fill="#F4F1EB" stroke="#2D2319" strokeWidth="1.75" />

      {/* Front Wedge Face (Creamy Baked Cheese) */}
      <path d="M12 49L36 53V32L12 28V49Z" fill="#FDF0CD" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Graham Cracker Crust Bottom */}
      <path d="M12 46L36 50V53L12 49V46Z" fill="#B47836" stroke="#2D2319" strokeWidth="1.5" />

      {/* Side Face (Toasted Golden Edge) */}
      <path d="M36 53L54 39V18L36 32V53Z" fill="#F5C469" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      {/* Crust on Back Edge */}
      <path d="M36 50L54 36V39L36 53V50Z" fill="#A16226" stroke="#2D2319" strokeWidth="1.2" />

      {/* Top Baked Surface */}
      <path d="M12 28L30 14L54 18L36 32L12 28Z" fill="#FCE5A2" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />

      {/* Glossy Fruit Coulis Glaze (Strawberry / Berry Compote) */}
      <path d="M22 24C26 21 34 23 42 20C40 24 35 26 28 27C24 27 22 25 22 24Z" fill="#BE123C" />
      <circle cx="29" cy="23" r="2.5" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="34" cy="22" r="2.2" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="32" cy="25" r="2" fill="#9F1239" stroke="#2D2319" strokeWidth="1.2" />
      
      {/* Mint Leaf Accent */}
      <path d="M38 18C41 16 43 18 41 20C39 20 38 19 38 18Z" fill="#16A34A" stroke="#2D2319" strokeWidth="1" />
    </svg>
  );
}

/**
 * 9. Celebration Sparkler & Confetti Party Cake
 */
export function IconCelebrationSparklerCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Stand */}
      <ellipse cx="32" cy="57" rx="24" ry="4" fill="#E5E7EB" stroke="#2D2319" strokeWidth="1.75" />

      {/* Double Tier Cake */}
      {/* Bottom Tier */}
      <rect x="16" y="38" width="32" height="18" rx="2" fill="#6EE7B7" stroke="#2D2319" strokeWidth="2" />
      <path d="M16 42C19 44 21 44 24 42C27 44 29 44 32 42C35 44 37 44 40 42C43 44 45 44 48 42" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      
      {/* Top Tier */}
      <rect x="22" y="26" width="20" height="12" rx="2" fill="#F472B6" stroke="#2D2319" strokeWidth="2" />
      <path d="M22 29C24 31 26 31 28 29C30 31 32 31 34 29C36 31 38 31 40 29L42 29" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />

      {/* Festive Sparkler Stars & Fireworks */}
      {/* Left Sparkler */}
      <line x1="26" y1="26" x2="21" y2="15" stroke="#2D2319" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M21 9V15M18 12H24M19 10L23 14M19 14L23 10" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="21" cy="12" r="1.5" fill="#FEF08A" />

      {/* Right Sparkler */}
      <line x1="38" y1="26" x2="43" y2="15" stroke="#2D2319" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M43 9V15M40 12H46M41 10L45 14M41 14L45 10" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="43" cy="12" r="1.5" fill="#FEF08A" />

      {/* Floating Confetti Sparks */}
      <circle cx="12" cy="22" r="1.5" fill="#EC4899" />
      <circle cx="15" cy="14" r="1.5" fill="#3B82F6" />
      <circle cx="49" cy="18" r="1.5" fill="#10B981" />
      <circle cx="52" cy="26" r="1.5" fill="#F59E0B" />
      <path d="M30 11L32 14L34 11L32 8Z" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 10. Botanical Floral Garden Cake (Pastel Garden Petals & Edible Blossoms)
 */
export function IconBotanicalFloralCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="24" ry="4" fill="#EDE8DF" stroke="#2D2319" strokeWidth="1.75" />

      {/* Sage-Blush Frosted Cake Body */}
      <rect x="15" y="30" width="34" height="25" rx="3" fill="#F7FBF6" stroke="#2D2319" strokeWidth="2" />
      <ellipse cx="32" cy="30" rx="17" ry="5.5" fill="#FFFFFF" stroke="#2D2319" strokeWidth="2" />

      {/* Cascade of Buttercream Peonies & Blossom Petals */}
      {/* Rose 1 (Center) */}
      <circle cx="32" cy="24" r="4.5" fill="#FDA4AF" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="32" cy="24" r="2" fill="#F43F5E" />
      
      {/* Rose 2 (Left) */}
      <circle cx="24" cy="27" r="4" fill="#FBCFE8" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="24" cy="27" r="1.8" fill="#EC4899" />

      {/* Rose 3 (Right) */}
      <circle cx="40" cy="27" r="4" fill="#FEF08A" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="40" cy="27" r="1.8" fill="#F59E0B" />

      {/* Cascading Petals Down the Cake */}
      <path d="M22 36C20 38 22 41 24 39C26 37 24 35 22 36Z" fill="#FDA4AF" stroke="#2D2319" strokeWidth="1.2" />
      <path d="M28 42C26 44 28 47 30 45C32 43 30 41 28 42Z" fill="#FBCFE8" stroke="#2D2319" strokeWidth="1.2" />
      <path d="M25 48C23 50 25 53 27 51C29 49 27 47 25 48Z" fill="#FDA4AF" stroke="#2D2319" strokeWidth="1.2" />

      {/* Sage Green Botanical Leaves */}
      <path d="M37 22C41 20 42 23 40 25C38 25 37 23 37 22Z" fill="#4ADE80" stroke="#2D2319" strokeWidth="1.2" />
      <path d="M19 28C16 27 16 30 18 31C19 31 20 29 19 28Z" fill="#22C55E" stroke="#2D2319" strokeWidth="1.2" />
      <path d="M44 32C46 33 46 36 44 36C43 35 43 33 44 32Z" fill="#4ADE80" stroke="#2D2319" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * 11. Tiramisu Coffee Gateau Layer Slice
 */
export function IconTiramisuCoffeeCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="25" ry="4" fill="#EAE5DC" stroke="#2D2319" strokeWidth="1.75" />

      {/* Front Face Layers (Savoiardi Espresso Sponge & Mascarpone Cream) */}
      <path d="M12 48L36 53V31L12 26V48Z" fill="#F6E7C9" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Espresso Coffee Stripes */}
      <path d="M12 33L36 38V41L12 36V33Z" fill="#6F4E37" />
      <path d="M12 43L36 48V50L12 45V43Z" fill="#6F4E37" />

      {/* Mascarpone Pillows Front */}
      <circle cx="18" cy="34.5" r="1.5" fill="#FFFBF2" />
      <circle cx="24" cy="36" r="1.5" fill="#FFFBF2" />
      <circle cx="30" cy="37.5" r="1.5" fill="#FFFBF2" />

      {/* Side Face */}
      <path d="M36 53L54 39V17L36 31V53Z" fill="#E8D7B8" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />

      {/* Top Cocoa-Dusted Layer */}
      <path d="M12 26L30 12L54 17L36 31L12 26Z" fill="#78350F" stroke="#2D2319" strokeWidth="2" strokeLinejoin="round" />

      {/* Piped Mascarpone Cream Dollops on Top */}
      <circle cx="22" cy="22" r="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="30" cy="19" r="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="38" cy="22" r="3" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="44" cy="21" r="2.5" fill="#FFFDF8" stroke="#2D2319" strokeWidth="1.2" />

      {/* Roasted Coffee Bean on Top */}
      <ellipse cx="31" cy="16" rx="2.5" ry="3.5" transform="rotate(30 31 16)" fill="#451A03" stroke="#2D2319" strokeWidth="1" />
      <path d="M30 14C32 16 30 18 32 19" stroke="#78350F" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * 12. Baby Shower & Kids Pastel Cloud Cake
 */
export function IconBabyShowerPastelCake({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="24" ry="4" fill="#E0F2FE" stroke="#2D2319" strokeWidth="1.75" />

      {/* Bottom Tier (Soft Baby Sky Blue) */}
      <rect x="15" y="38" width="34" height="17" rx="3" fill="#BAE6FD" stroke="#2D2319" strokeWidth="2" />
      <ellipse cx="32" cy="38" rx="17" ry="4.5" fill="#E0F2FE" stroke="#2D2319" strokeWidth="1.5" />

      {/* Polka Dots */}
      <circle cx="21" cy="46" r="1.5" fill="#FFFFFF" />
      <circle cx="29" cy="48" r="1.5" fill="#FFFFFF" />
      <circle cx="37" cy="46" r="1.5" fill="#FFFFFF" />
      <circle cx="44" cy="48" r="1.5" fill="#FFFFFF" />

      {/* Top Tier (Baby Pastel Pink) */}
      <rect x="21" y="24" width="22" height="14" rx="2.5" fill="#FBCFE8" stroke="#2D2319" strokeWidth="2" />
      <ellipse cx="32" cy="24" rx="11" ry="3.5" fill="#FDF2F8" stroke="#2D2319" strokeWidth="1.5" />

      {/* Bunting Party Flags on String */}
      <path d="M22 27C27 30 37 30 42 27" stroke="#2D2319" strokeWidth="1.2" />
      <polygon points="25,28 28,33 29,28" fill="#FBBF24" />
      <polygon points="31,29 33,34 35,29" fill="#38BDF8" />
      <polygon points="37,28 39,33 41,28" fill="#F472B6" />

      {/* Miniature Golden Crown / Star Topper */}
      <polygon points="32,12 34,16 38,17 35,20 36,24 32,22 28,24 29,20 26,17 30,16" fill="#F59E0B" stroke="#2D2319" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 13. Single Milestone Candle Celebration Cake
 */
export function IconSingleMilestoneCandle({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="25" ry="4" fill="#EADBC8" stroke="#2D2319" strokeWidth="1.75" />

      {/* Sleek Modern Cylinder Cake */}
      <rect x="15" y="32" width="34" height="23" rx="3" fill="#FFFDF9" stroke="#2D2319" strokeWidth="2" />
      <ellipse cx="32" cy="32" rx="17" ry="6" fill="#FFFFFF" stroke="#2D2319" strokeWidth="2" />

      {/* Gold Leaf Ribbon at Base */}
      <path d="M15 51C20 54 44 54 49 51V54C44 57 20 57 15 54V51Z" fill="#D4AF37" stroke="#2D2319" strokeWidth="1.5" />

      {/* Tall Artisan Gold Milestone Candle */}
      <rect x="30.5" y="15" width="3" height="17" rx="1" fill="#D4AF37" stroke="#2D2319" strokeWidth="1.5" />
      <line x1="32" y1="15" x2="32" y2="12" stroke="#2D2319" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tear-drop flame */}
      <path d="M32 5C30 8 30 10 32 12C34 10 34 8 32 5Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <circle cx="32" cy="9.5" r="1.2" fill="#FEF08A" />

      {/* Delicate Side Cream Swags */}
      <path d="M16 38C21 42 27 42 32 38C37 42 43 42 48 38" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 14. Japanese Roll Cake Roulade Slice
 */
export function IconRollCakeRoulade({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="24" ry="4" fill="#EDE4D8" stroke="#2D2319" strokeWidth="1.75" />

      {/* Roulade Roll Circle Face */}
      <circle cx="32" cy="34" r="19" fill="#FDE68A" stroke="#2D2319" strokeWidth="2" />
      
      {/* Golden Baked Outer Crust Ring */}
      <circle cx="32" cy="34" r="19" fill="none" stroke="#C28A4E" strokeWidth="3" />

      {/* Chantilly Cream Swirl Filling (Spiral) */}
      <path
        d="M32 18C41 18 48 25 48 34C48 43 41 50 32 50C23 50 16 43 16 34C16 27 21 21 28 21C34 21 39 25 39 31C39 36 35 40 31 40C28 40 25 38 25 35C25 32 27 30 30 30"
        stroke="#FFFDF8"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Strawberry Gem in Center of Spiral */}
      <circle cx="32" cy="34" r="3.5" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="31" cy="33" r="0.8" fill="#FEF08A" />

      {/* Top Cream Puff Accent */}
      <ellipse cx="32" cy="14" rx="4.5" ry="3" fill="#FFFFFF" stroke="#2D2319" strokeWidth="1.5" />
      <circle cx="32" cy="11" r="2.5" fill="#DC2626" />
    </svg>
  );
}

/**
 * 15. Macaron Tower & French Patisserie Confection
 */
export function IconMacaronTowerConfection({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <ellipse cx="32" cy="56" rx="24" ry="4" fill="#E8DFD3" stroke="#2D2319" strokeWidth="1.75" />

      {/* Tier Base Cake */}
      <rect x="18" y="41" width="28" height="14" rx="2.5" fill="#FFFDF8" stroke="#2D2319" strokeWidth="2" />
      <path d="M18 45H46" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Macaron 1 (Bottom Pastel Pistachio) */}
      <ellipse cx="32" cy="37" rx="12" ry="3.5" fill="#86EFAC" stroke="#2D2319" strokeWidth="1.5" />
      <line x1="20" y1="37" x2="44" y2="37" stroke="#FFFFFF" strokeWidth="2" />

      {/* Macaron 2 (Middle Pastel Strawberry Pink) */}
      <ellipse cx="32" cy="28" rx="10" ry="3.2" fill="#F472B6" stroke="#2D2319" strokeWidth="1.5" />
      <line x1="22" y1="28" x2="42" y2="28" stroke="#FFFFFF" strokeWidth="1.8" />

      {/* Macaron 3 (Top Pastel Lemon Yellow) */}
      <ellipse cx="32" cy="19" rx="8" ry="3" fill="#FDE047" stroke="#2D2319" strokeWidth="1.5" />
      <line x1="24" y1="19" x2="40" y2="19" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Golden Crown Sparkle on Peak */}
      <polygon points="32,8 33.5,11.5 37,12 34.5,14.5 35,18 32,16 29,18 29.5,14.5 27,12 30.5,11.5" fill="#F59E0B" stroke="#2D2319" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 16. All Cakes Signature Grand Emblem (Opulent Golden Baker's Celebration Cake)
 */
export function IconAllCakesGrand({ size = 32, style, className }: CakeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Pedestal Base */}
      <ellipse cx="32" cy="56" rx="25" ry="4.5" fill="#E8DFD3" stroke="#2D2319" strokeWidth="2" />
      <path d="M22 56V59C22 60.5 26 61.5 32 61.5C38 61.5 42 60.5 42 59V56" fill="#D4AF37" stroke="#2D2319" strokeWidth="1.75" />

      {/* Grand Tier 1 */}
      <rect x="14" y="38" width="36" height="17" rx="2.5" fill="#FFFDF9" stroke="#2D2319" strokeWidth="2" />
      <path d="M14 43C18 45.5 22 45.5 26 43C30 45.5 34 45.5 38 43C42 45.5 46 45.5 50 43" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      
      {/* Grand Tier 2 */}
      <rect x="20" y="24" width="24" height="14" rx="2" fill="#FDF3DA" stroke="#2D2319" strokeWidth="2" />
      <path d="M20 28C23 30 25 30 28 28C31 30 33 30 36 28C39 30 41 30 44 28" stroke="#D4AF37" strokeWidth="1.75" strokeLinecap="round" />

      {/* Triple Strawberry Rosettes on Top */}
      <circle cx="26" cy="22" r="3" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="32" cy="20" r="3.5" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />
      <circle cx="38" cy="22" r="3" fill="#E11D48" stroke="#2D2319" strokeWidth="1.2" />

      {/* Golden Sovereign Crown / Star Peak */}
      <polygon points="32,6 34.5,11 39.5,12 36,15.5 37,20.5 32,18 27,20.5 28,15.5 24.5,12 29.5,11" fill="#F59E0B" stroke="#2D2319" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="13" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Universal Registry of Colourful Illustrated Cake Icons
 */
export const CAKE_ICONS_MAP: Record<string, React.ComponentType<CakeIconProps>> = {
  BirthdayCandlesCake: IconBirthdayCandlesCake,
  StrawberryShortcakeSlice: IconStrawberryShortcakeSlice,
  TieredWeddingRoyal: IconTieredWeddingRoyal,
  ChocolateGanacheFudge: IconChocolateGanacheFudge,
  BentoPetiteCake: IconBentoPetiteCake,
  RedVelvetHeart: IconRedVelvetHeart,
  GourmetCupcakeSwirl: IconGourmetCupcakeSwirl,
  CheesecakeSlice: IconCheesecakeSlice,
  CelebrationSparklerCake: IconCelebrationSparklerCake,
  BotanicalFloralCake: IconBotanicalFloralCake,
  TiramisuCoffeeCake: IconTiramisuCoffeeCake,
  BabyShowerPastelCake: IconBabyShowerPastelCake,
  SingleMilestoneCandle: IconSingleMilestoneCandle,
  RollCakeRoulade: IconRollCakeRoulade,
  MacaronTowerConfection: IconMacaronTowerConfection,
  AllCakesGrand: IconAllCakesGrand,

  // Legacy mappings for existing DB categories:
  PartyPopper: IconBirthdayCandlesCake,
  Crown: IconTieredWeddingRoyal,
  Heart: IconRedVelvetHeart,
  Cookie: IconChocolateGanacheFudge,
  Flower2: IconBotanicalFloralCake,
  Shapes: IconBentoPetiteCake,
  Palette: IconStrawberryShortcakeSlice,
  Cake: IconAllCakesGrand,
  Gift: IconMacaronTowerConfection,
  Flame: IconSingleMilestoneCandle,
  Coffee: IconTiramisuCoffeeCake,
  Smile: IconGourmetCupcakeSwirl,
  Star: IconCelebrationSparklerCake,
  Baby: IconBabyShowerPastelCake,
  GlassWater: IconCheesecakeSlice,
};

/**
 * Universal Cake Category Icon Renderer
 */
export default function CategoryCakeIcon({ name = "Cake", size = 32, style, className }: CakeIconProps) {
  const IconComp = CAKE_ICONS_MAP[name] || CAKE_ICONS_MAP.AllCakesGrand;
  return <IconComp size={size} style={style} className={className} />;
}
