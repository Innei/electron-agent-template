import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const card = style({
  maxWidth: 480,
  width: "100%",
});

globalStyle(`${card} h1`, {
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.textPrimary,
  marginBottom: 10,
});

export const explainer = style({
  fontSize: vars.fontSize.base,
  color: vars.color.textSecondary,
  lineHeight: 1.6,
  marginBottom: 14,
});

globalStyle(`${explainer} a`, {
  color: vars.color.accent,
});

export const list = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  overflow: "hidden",
});

export const prow = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const prowRec = style({
  background: "rgb(250 204 21 / 0.05)",
  boxShadow: "inset 2px 0 0 #facc15",
});

export const prowMain = style({
  flex: 1,
  minWidth: 0,
});

export const prowName = style({
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const prowSub = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
  marginTop: 2,
});

export const recTag = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  padding: "1px 7px",
  borderRadius: 999,
  color: "#facc15",
  border: "1px solid #facc15",
});

export const install = style({
  marginTop: 12,
});

export const cliCommand = style({
  margin: "0 0 14px",
  padding: "12px 14px",
  overflowX: "auto",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  background: vars.color.bgElement,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
});

export const apiKey = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
});

export const skipRow = style({
  display: "flex",
  justifyContent: "center",
  marginTop: 14,
});

export const skipLink = style({
  background: "none",
  border: "none",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  cursor: "pointer",
  padding: 0,
  selectors: {
    "&:hover:not(:disabled)": {
      color: vars.color.textPrimary,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "default",
    },
  },
});
