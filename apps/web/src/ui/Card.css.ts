import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  background: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  padding: 12,
});

export const link = style({
  cursor: "pointer",
  textDecoration: "none",
  selectors: {
    "&:hover": {
      background: vars.color.bgHover,
      borderColor: vars.color.borderStrong,
    },
  },
});
