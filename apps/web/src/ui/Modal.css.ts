import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";
import { viewport as scrollViewport } from "./ScrollArea.css";

export const backdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  opacity: 1,
  transition: "opacity 180ms ease",
  selectors: {
    '&[data-state="entering"]': { opacity: 0 },
    '&[data-state="closing"]': { opacity: 0 },
  },
});

export const panel = style({
  background: `var(--bg-page, ${vars.color.bgSurface})`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  width: "min(860px, 100%)",
  maxHeight: "calc(100vh - 64px)",
  display: "flex",
  flexDirection: "column",
  transform: "translateY(0) scale(1)",
  opacity: 1,
  transition: "transform 200ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 180ms ease",
  selectors: {
    '&[data-state="entering"]': {
      transform: "translateY(8px) scale(0.97)",
      opacity: 0,
    },
    '&[data-state="closing"]': {
      transform: "translateY(8px) scale(0.97)",
      opacity: 0,
    },
  },
});

export const head = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 18px",
  borderBottom: `1px solid ${vars.color.border}`,
});

export const title = style({
  minWidth: 0,
  overflow: "hidden",
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const headActions = style({
  display: "flex",
  flex: "0 0 auto",
  alignItems: "center",
  gap: 4,
});

export const headAction = style({
  display: "inline-flex",
  width: 24,
  height: 24,
  padding: 0,
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.textSecondary,
  background: "none",
  border: "none",
  borderRadius: vars.radius,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.bgHover,
    },
    "&:focus-visible": {
      outline: vars.focus.outline,
      outlineOffset: 1,
    },
  },
});

export const close = headAction;

export const body = style({
  flex: "1 1 auto",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

globalStyle(`${body} > ${scrollViewport}`, {
  flex: "1 1 auto",
  minHeight: 0,
  height: "auto",
});

export const bodyContent = style({
  padding: "16px 20px",
});
