import { globalStyle, style } from "@vanilla-extract/css";
import { appRegionNoDrag } from "../styles/electron.css";
import { vars } from "../styles/theme.css";

export const trigger = style([
  appRegionNoDrag,
  {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    flex: "0 0 auto",
    alignSelf: "center",
    marginLeft: 0,
    padding: 0,
    color: vars.color.textMuted,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transitionProperty: "color, scale",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease-out",
    selectors: {
      "&:hover": {
        color: vars.color.textPrimary,
      },
      "&:active": {
        scale: 0.96,
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transition: "none",
      },
    },
  },
]);

export const triggerActive = style({
  color: vars.color.textPrimary,
});

export const visual = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 6,
  transitionProperty: "background-color",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    [`${trigger}:hover &`]: {
      background: vars.color.bgHover,
    },
    [`${triggerActive} &`]: {
      background: vars.color.bgHover,
    },
  },
});

export const positioner = style({
  zIndex: 300,
  outline: "none",
});

export const popup = style([
  appRegionNoDrag,
  {
    width: 196,
    padding: 4,
    color: vars.color.textPrimary,
    background: vars.color.bgElement,
    border: `1px solid ${vars.color.borderStrong}`,
    borderRadius: vars.radius,
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.45)",
    outline: "none",
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: "120ms",
    transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
    selectors: {
      "&[data-starting-style]": {
        opacity: 0,
        transform: "translateY(-3px)",
      },
      "&[data-ending-style]": {
        opacity: 0,
        transform: "translateY(-3px)",
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transition: "none",
      },
    },
  },
]);

export const menu = style({
  display: "flex",
  flexDirection: "column",
  paddingTop: 4,
  borderTop: `1px solid ${vars.color.border}`,
});

export const menuItem = style({
  display: "grid",
  gridTemplateColumns: "16px 1fr auto",
  alignItems: "center",
  gap: 7,
  width: "100%",
  minHeight: 32,
  padding: "0 7px",
  color: vars.color.textSecondary,
  background: "transparent",
  border: "none",
  borderRadius: vars.radius,
  cursor: "pointer",
  fontSize: vars.fontSize.sm,
  textAlign: "left",
  transitionProperty: "color, background-color, scale",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&:active": {
      scale: 0.96,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

globalStyle(`${menuItem} svg`, {
  opacity: 0.75,
});

globalStyle(`${menuItem} kbd`, {
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});
