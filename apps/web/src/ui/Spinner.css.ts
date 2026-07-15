import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

export const root = style({
  border: `2px solid ${vars.color.borderStrong}`,
  borderTopColor: vars.color.accent,
  borderRadius: "50%",
  width: 11,
  height: 11,
  animation: `${spin} 0.9s linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});
