import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  width: 28,
  height: 16,
  padding: 2,
  boxSizing: "border-box",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  background: vars.color.bgCanvas,
  cursor: "pointer",
  transition: "background 120ms ease, border-color 120ms ease",
  selectors: {
    "&:hover:not([data-disabled])": {
      borderColor: vars.color.textMuted,
    },
    "&[data-checked]": {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 68%, ${vars.color.borderStrong})`,
      background: `color-mix(in srgb, ${vars.color.accent} 12%, ${vars.color.bgCanvas})`,
    },
    "&[data-checked]:hover:not([data-disabled])": {
      borderColor: vars.color.accent,
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "default",
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.accent}`,
      outlineOffset: 2,
    },
  },
});

export const thumb = style({
  width: 10,
  height: 10,
  borderRadius: 1,
  background: vars.color.textMuted,
  transform: "translateX(0)",
  transition: "transform 120ms ease, background 120ms ease",
});

globalStyle(`${root}[data-checked] ${thumb}`, {
  background: vars.color.accent,
  transform: "translateX(12px)",
});
