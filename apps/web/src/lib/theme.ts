import { tokens } from "../styles/tokens";

export const theme = {
  bgCanvas: tokens.color.bgCanvas,
  bgSurface: tokens.color.bgSurface,
  bgElement: tokens.color.bgElement,
  border: tokens.color.border,
  gridLine: tokens.color.gridLine,
  borderStrong: tokens.color.borderStrong,
  textPrimary: tokens.color.textPrimary,
  textSecondary: tokens.color.textSecondary,
  textMuted: tokens.color.textMuted,
  accent: tokens.color.accent,
  up: tokens.color.up,
  down: tokens.color.down,
  fontMono: tokens.font.mono,
} as const;

export const seriesPalette = [theme.accent, theme.textPrimary, theme.up, theme.down, theme.textSecondary] as const;
