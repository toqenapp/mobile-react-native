import appColors from "./colors.json";

export const elementTheme = {
  primaryGradient: [
    appColors.primary["600"],
    appColors.emerald["600"],
    appColors.purple["600"],
  ] as const,

  disabledGradient: [
    appColors.border,
    appColors.muted,
    appColors.border,
  ] as const,

  shimmerSessionColors: [
    appColors.accent["500"],
    appColors.info["500"],
    appColors.purple["400"],
    appColors.warning["600"],
  ] as const,

  primaryText: appColors.background,

  secondaryBackground: appColors.surface,
  secondaryBorder: appColors.border,
  secondaryText: appColors.text,

  ghostBackground: "transparent",
  ghostBorder: appColors.border,
  ghostText: appColors.text,

  blackBackground: "#374151",
  blackBorder: "#374151",
  blackText: appColors.text,

  whiteBackground: "#FFFFFF",
  whiteBorder: "rgba(255,255,255,0.18)",
  whiteText: "#334155",
} as const;

function addAlpha(hex: string, alpha: number) {
  if (!hex.startsWith("#")) return hex;

  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Props = { seed?: number; centerAlpha?: number };

export function pickSessionColors(props?: Props) {
  const { seed, centerAlpha = 0.55 } = props || {};
  const colors = elementTheme.shimmerSessionColors;

  const base =
    typeof seed === "number"
      ? colors[Math.abs(seed) % colors.length]
      : colors[Math.floor(Math.random() * colors.length)];

  return {
    edgeColor: addAlpha(base, 0.06),
    centerColor: addAlpha(base, centerAlpha),
  };
}
