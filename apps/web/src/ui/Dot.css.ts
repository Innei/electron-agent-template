import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

const dotPulse = keyframes({
  "50%": { opacity: 0.3 },
});

export const root = style({
  display: "inline-block",
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: vars.color.textSecondary,
  flexShrink: 0,
});

export const tone = styleVariants({
  accent: { background: vars.color.accent },
  ok: { background: vars.color.ok },
  up: { background: vars.color.up },
  down: { background: vars.color.down },
});

export const pulse = style({
  animation: `${dotPulse} 1.5s infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});
