import { createVar, globalStyle, keyframes, style } from "@vanilla-extract/css";
import { appRegionDrag, appRegionNoDrag } from "../styles/electron.css";
import { vars } from "../styles/theme.css";

const tabstripFadeStart = createVar({
  syntax: "<length>",
  inherits: false,
  initialValue: "0px",
});

const tabstripFadeEnd = createVar({
  syntax: "<length>",
  inherits: false,
  initialValue: "0px",
});

const fadeStart = keyframes({
  "0%": { vars: { [tabstripFadeStart]: "0px" } },
  "6%, 100%": { vars: { [tabstripFadeStart]: "14px" } },
});

const fadeEnd = keyframes({
  "0%, 94%": { vars: { [tabstripFadeEnd]: "14px" } },
  "100%": { vars: { [tabstripFadeEnd]: "0px" } },
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
    alignItems: "stretch",
    gap: 8,
    background: vars.color.bgSurface,
    borderBottom: `1px solid ${vars.color.border}`,
  },
]);

export const trafficSpacer = style({
  flex: "0 0 78px",
});

export const tabstrip = style({
  flex: 1,
  height: "100%",
});

export const tabstripViewport = style([
  appRegionDrag,
  {
    vars: {
      [tabstripFadeStart]: "0px",
      [tabstripFadeEnd]: "0px",
    },
    maskImage: `linear-gradient(to right, transparent 0, black ${tabstripFadeStart}, black calc(100% - ${tabstripFadeEnd}), transparent 100%)`,
    animationName: `${fadeStart}, ${fadeEnd}`,
    animationTimingFunction: "linear",
    animationTimeline: "scroll(self inline)",
  },
]);

export const tabstripContent = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "0 4px",
  height: "100%",
  minWidth: "100%",
  width: "max-content",
});

export const tab = style([
  appRegionNoDrag,
  {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flex: "0 0 auto",
    maxWidth: 170,
    minWidth: 0,
    padding: "0 10px",
    height: 28,
    alignSelf: "center",
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
    background: "transparent",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "color 0.12s ease, background 0.12s ease",
  },
]);

export const tabActive = style({
  color: vars.color.accent,
  background: "rgba(255, 176, 0, 0.12)",
  fontWeight: 600,
});

globalStyle(`${tab}:not(${tabActive}):hover`, {
  color: vars.color.textSecondary,
  background: vars.color.bgElement,
});

export const tabIconWrap = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  selectors: {
    [`${tabActive} &`]: {
      width: 18,
      height: 18,
      borderRadius: 5,
      border: "1px solid rgba(255, 176, 0, 0.35)",
      background: "rgba(255, 176, 0, 0.08)",
    },
  },
});

export const tabIcon = style({
  flex: "0 0 auto",
  opacity: 0.65,
  selectors: {
    [`${tabActive} &`]: {
      color: vars.color.accent,
      opacity: 1,
    },
  },
});

export const tabTitle = style({
  flex: "0 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const tabClose = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 15,
  height: 15,
  flex: "0 0 auto",
  marginRight: -2,
  borderRadius: vars.radius,
  color: vars.color.textMuted,
  opacity: 0,
  transition: "opacity 0.12s ease, color 0.12s ease, background 0.12s ease",
  selectors: {
    [`${tab}:hover &, ${tabActive} &`]: {
      opacity: 0.6,
    },
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
      opacity: 1,
    },
  },
});

export const actions = style([
  appRegionNoDrag,
  {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: 2,
    paddingRight: 7,
  },
]);

export const updateBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  color: vars.color.accent,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  borderRadius: vars.radius,
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: "rgba(255, 176, 0, 0.12)",
    },
  },
});

export const settings = style([
  appRegionNoDrag,
  {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
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

export const settingsActive = style({
  color: vars.color.accent,
});

export const actionVisual = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: vars.radius,
  transitionProperty: "background-color",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    [`${settings}:hover &`]: {
      background: vars.color.bgHover,
    },
    [`${settingsActive} &`]: {
      background: "rgba(255, 176, 0, 0.12)",
    },
  },
});

export const hubStatus = style([
  appRegionNoDrag,
  {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
  },
]);

export const hubStatusDim = style({
  opacity: 0.4,
});
