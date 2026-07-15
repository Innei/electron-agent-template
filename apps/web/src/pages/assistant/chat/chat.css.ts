import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../styles/theme.css";

const chatCursorBlink = keyframes({
  "50%": { opacity: 0 },
});

export const panelBodyContent = style({
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const composer = style({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
});

export const composerField = style({
  flex: "1 1 auto",
  minWidth: 0,
});

export const composerFieldMultiline = style({});

export const composerAction = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: vars.controlH,
  height: vars.controlH,
  padding: 0,
  transitionProperty: "scale, border-color, background-color",
  transitionDuration: "150ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&:active:not([disabled])": {
      scale: 0.96,
    },
  },
});

export const composerActionStop = style({
  color: vars.color.down,
  borderColor: vars.color.down,
});

export const composerActionSend = style({});

export const composerActionIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const hint = style({
  flex: "0 0 auto",
  padding: "0 12px 8px",
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
});

export const row = style({
  display: "flex",
});

export const rowUser = style({
  justifyContent: "flex-end",
});

export const assistantMessage = style({
  minWidth: 0,
  maxWidth: "100%",
});

export const bubble = style({
  maxWidth: "88%",
  fontSize: vars.fontSize.base,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
});

export const bubbleUser = style({
  background: vars.color.bgElement,
  color: vars.color.textPrimary,
  padding: "6px 10px",
  borderRadius: vars.radius,
});

export const bubbleAssistant = style({
  maxWidth: "100%",
});

export const messageMeta = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 5,
  marginTop: 5,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontVariantNumeric: "tabular-nums",
});

globalStyle(`${messageMeta} > span + span::before`, {
  content: "·",
  marginRight: 5,
  color: vars.color.borderStrong,
});

export const cursor = style({
  display: "inline-block",
  width: 6,
  height: 12,
  marginLeft: 2,
  verticalAlign: -2,
  background: vars.color.accent,
  animation: `${chatCursorBlink} 0.9s steps(1) infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const tool = style({
  alignSelf: "flex-start",
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const toolHead = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 7px",
  background: "none",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: "pointer",
  textAlign: "left",
  selectors: {
    "&:disabled": {
      cursor: "default",
    },
    "&:not(:disabled):hover": {
      borderColor: vars.color.borderStrong,
      color: vars.color.textSecondary,
    },
  },
});

export const toolSummary = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
  fontFamily: vars.font.mono,
  color: vars.color.textMuted,
});

export const toolDot = style({
  flex: "none",
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: vars.color.up,
});

export const toolDotRunning = style({
  background: vars.color.accent,
  animation: `${chatCursorBlink} 0.9s steps(1) infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const toolCaret = style({
  flex: "none",
  transition: "transform 0.12s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const toolCaretOpen = style({
  transform: "rotate(90deg)",
});

export const toolDetail = style({
  display: "flex",
  flexDirection: "column",
  gap: 6,
  paddingLeft: 7,
});

export const toolDetailLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  marginBottom: 2,
});

globalStyle(`${toolDetail} pre`, {
  margin: 0,
  padding: "6px 8px",
  maxHeight: 200,
  overflow: "auto",
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const errorRow = style({
  fontSize: vars.fontSize.base,
  color: vars.color.down,
  background: vars.color.bgElement,
  borderLeft: `2px solid ${vars.color.down}`,
  padding: "6px 8px",
});

export const empty = style({
  padding: "20px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
});

export const emptyText = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
});

export const suggestions = style({
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "center",
});

export const suggestion = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
  background: "none",
  border: `1px dashed ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  padding: "4px 9px",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      borderColor: vars.color.accent,
      borderStyle: "solid",
    },
  },
});

export const insert = style({
  margin: "10px 0",
});
