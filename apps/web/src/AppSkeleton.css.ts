import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { appRegionDrag } from "./styles/electron.css";
import { vars } from "./styles/theme.css";

const shimmer = keyframes({
  "0%": { backgroundPosition: "100% 0" },
  "100%": { backgroundPosition: "-100% 0" },
});

export const root = style({
  minHeight: "100vh",
  background: vars.color.bgCanvas,
  color: vars.color.textPrimary,
});

export const desktop = style({
  paddingTop: 40,
});

export const titlebar = style([
  appRegionDrag,
  {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 80,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: vars.color.bgSurface,
    borderBottom: `1px solid ${vars.color.border}`,
  },
]);

export const traffic = style({
  flex: "0 0 78px",
});

export const tabstrip = style({
  flex: 1,
  minWidth: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  paddingLeft: 4,
});

export const bone = style({
  borderRadius: vars.radius,
  background: "linear-gradient(90deg, #1a1a1a 0%, #242424 45%, #1a1a1a 90%)",
  backgroundSize: "200% 100%",
  animation: `${shimmer} 1.5s ease-in-out infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
      background: vars.color.bgElement,
    },
  },
});

export const boneVariant = styleVariants({
  tab: { width: 96, height: 18 },
  input: { width: 170, height: 28 },
  row: { width: "100%", height: 18 },
  chartTitle: { width: 100, height: 14, marginBottom: 8 },
  chart: {
    width: "100%",
    height: 340,
    border: `1px solid ${vars.color.border}`,
    backgroundColor: vars.color.bgSurface,
  },
});
