import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const positioner = style({
  zIndex: 300,
  outline: "none",
});

export const popup = style({
  minWidth: 168,
  padding: 4,
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.45)",
  fontSize: vars.fontSize.sm,
  color: vars.color.textPrimary,
  outline: "none",
});

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "5px 8px",
  borderRadius: vars.radius,
  color: vars.color.textSecondary,
  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  selectors: {
    "&[data-highlighted]": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&[data-disabled]": {
      color: vars.color.textMuted,
      cursor: "default",
    },
  },
});

export const itemDanger = style({
  color: vars.color.down,
  selectors: {
    "&[data-highlighted]": {
      color: vars.color.bgCanvas,
      background: vars.color.down,
    },
  },
});

export const itemIcon = style({
  display: "inline-flex",
  flexShrink: 0,
  opacity: 0.8,
});

export const itemLabel = style({
  flex: 1,
  minWidth: 0,
});

export const itemShortcut = style({
  marginLeft: 16,
  flexShrink: 0,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
});

export const submenuTrigger = style({
  width: "100%",
});

export const submenuChevron = style({
  marginLeft: 12,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  lineHeight: 1,
});

export const separator = style({
  height: 1,
  margin: "4px 2px",
  background: vars.color.border,
});
