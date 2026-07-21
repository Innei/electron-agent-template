import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const logsPage = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  gap: 10,
});

export const header = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
});

globalStyle(`${header} h1`, {
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.textPrimary,
  margin: 0,
});

export const path = style({
  marginTop: 4,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  overflowWrap: "anywhere",
});

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
});

globalStyle(`${actions} button`, {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

export const error = style({
  margin: 0,
});

export const meta = style({
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const viewer = style({
  flex: 1,
  minHeight: 420,
  maxHeight: "calc(100vh - 220px)",
  margin: 0,
  padding: "12px 14px",
  overflow: "auto",
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  background: vars.color.bgCanvas,
  color: vars.color.textSecondary,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});
