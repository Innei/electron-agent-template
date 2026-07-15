import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const logo = style({
  width: 26,
  height: 26,
  borderRadius: 6,
  overflow: "hidden",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
});

globalStyle(`${logo} svg`, {
  display: "block",
});

export const logoVariant = styleVariants({
  brand: {
    border: `1px solid ${vars.color.borderStrong}`,
  },
  key: {
    background: vars.color.bgElement,
    border: `1px solid ${vars.color.borderStrong}`,
    color: vars.color.textSecondary,
  },
});

globalStyle(`${logoVariant.brand} svg`, {
  width: 26,
  height: 26,
});
