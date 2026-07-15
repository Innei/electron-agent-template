import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  display: "grid",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
});

export const option = style({
  position: "relative",
  minWidth: 0,
  cursor: "pointer",
  selectors: {
    "& + &": {
      borderLeft: `1px solid ${vars.color.borderStrong}`,
    },
    "&:focus-within": {
      zIndex: 1,
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
});

globalStyle(`${option} input`, {
  position: "absolute",
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: "none",
});

globalStyle(`${option} span`, {
  display: "flex",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
  whiteSpace: "nowrap",
});

globalStyle(`${option} input:checked + span`, {
  background: vars.color.bgHover,
  color: vars.color.textPrimary,
  fontWeight: 600,
});
