import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const page = style({
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: 0,
  background: vars.color.bgCanvas,
  color: vars.color.textPrimary,
});

export const sidebar = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  borderRight: `1px solid ${vars.color.border}`,
  background: vars.color.bgSurface,
});

export const sidebarHead = style({
  flex: "0 0 auto",
  padding: 12,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const newSession = style({
  width: "100%",
  justifyContent: "center",
  gap: 6,
});

export const sidebarScroll = style({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: 6,
});

export const sidebarState = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  margin: "6px 5px",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const sidebarEmpty = style({
  margin: "12px 5px",
});

export const sessionRow = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 6,
  minHeight: vars.controlH,
  padding: "6px 8px",
  borderRadius: vars.radius,
  cursor: "pointer",
  transition: "background-color 0.12s ease",
  selectors: {
    "&:hover": {
      background: vars.color.bgHover,
    },
  },
});

export const sessionRowActive = style({
  background: "rgba(255, 176, 0, 0.1)",
});

export const sessionRowMain = style({
  flex: "1 1 auto",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

export const sessionTitle = style({
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

globalStyle(`${sessionRowActive} ${sessionTitle}`, {
  color: vars.color.accent,
});

export const sessionTime = style({
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const sessionDelete = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: 20,
  height: 20,
  borderRadius: vars.radius,
  color: vars.color.textMuted,
  background: "transparent",
  border: "none",
  opacity: 0,
  cursor: "pointer",
  transition: "opacity 0.12s ease, color 0.12s ease, background-color 0.12s ease",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.bgElement,
      opacity: 1,
    },
  },
});

globalStyle(`${sessionRow}:hover ${sessionDelete}`, {
  opacity: 0.6,
});

export const main = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  minWidth: 0,
  background: vars.color.bgCanvas,
});

export const empty = style({
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
});

export const confirm = style({});

globalStyle(`${confirm} p`, {
  margin: "0 0 12px",
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.base,
  lineHeight: 1.5,
  textWrap: "pretty",
});

export const confirmActions = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: 6,
});

export const queue = style({
  maxHeight: 168,
  marginBottom: 6,
  overflow: "hidden",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  background: vars.color.bgElement,
});

export const queueHead = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  minHeight: vars.controlH,
  padding: "0 8px",
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  letterSpacing: "0.04em",
});

export const queueCount = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: vars.radius,
  background: vars.color.bgHover,
  color: vars.color.textSecondary,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0,
});

export const queueItems = style({
  minWidth: 0,
  maxHeight: 136,
  overflowY: "auto",
});

export const queueRow = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 32,
  padding: "2px 2px 2px 8px",
  color: vars.color.textSecondary,
  selectors: {
    "& + &": {
      borderTop: `1px solid ${vars.color.border}`,
    },
  },
});

export const queueText = style({
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
});

export const queueError = style({
  flex: "0 0 auto",
  fontSize: vars.fontSize.xs,
  color: vars.color.down,
});

export const queueRemove = style({
  flex: "0 0 auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: vars.controlH,
  height: vars.controlH,
  borderRadius: vars.radius,
  background: "transparent",
  border: "none",
  color: vars.color.textMuted,
  cursor: "pointer",
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
      transitionDuration: "0.01ms",
    },
  },
});

export const mentionLayer = style({
  position: "absolute",
  zIndex: 8,
  left: 0,
  right: 0,
  bottom: "calc(100% + 6px)",
});

export const mentionPopover = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: 4,
  maxHeight: 240,
  overflowY: "auto",
  background: vars.color.bgSurface,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  boxShadow: "0 4px 16px rgb(0 0 0 / 0.45)",
});

export const mentionItem = style({
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  minHeight: vars.controlH,
  padding: "4px 8px",
  background: "none",
  border: "none",
  borderRadius: vars.radius,
  cursor: "pointer",
  textAlign: "left",
  selectors: {
    "&:hover": {
      background: vars.color.bgHover,
    },
  },
});

export const mentionItemActive = style({
  background: vars.color.bgHover,
});

export const mentionTitle = style({
  flex: "0 1 auto",
  fontSize: vars.fontSize.sm,
  color: vars.color.textPrimary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const mentionPath = style({
  flex: "1 1 auto",
  minWidth: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const mentionEmpty = style({
  padding: 12,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
});
