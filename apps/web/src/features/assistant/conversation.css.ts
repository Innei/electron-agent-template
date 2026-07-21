import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";
import * as chat from "./chat/chat.css";

export const conversation = style({
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  background: vars.color.bgCanvas,
});

export const conversationHead = style({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  padding: "0 max(12px, calc((100% - 68ch) / 2))",
  borderBottom: `1px solid ${vars.color.border}`,
  "@media": {
    "(max-width: 720px)": {
      paddingRight: 8,
      paddingLeft: 8,
    },
  },
});

export const conversationTitle = style({
  minWidth: 0,
  overflow: "hidden",
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  lineHeight: 1.2,
  textOverflow: "ellipsis",
  textWrap: "balance",
  whiteSpace: "nowrap",
});

export const conversationBody = style({
  flex: "1 1 auto",
  minHeight: 0,
});

globalStyle(`${conversationBody} ${chat.panelBodyContent}`, {
  minHeight: "100%",
  padding: "16px max(12px, calc((100% - 68ch) / 2))",
  gap: 12,
  "@media": {
    "(max-width: 720px)": {
      paddingRight: 8,
      paddingLeft: 8,
    },
  },
});

globalStyle(`${conversationBody} ${chat.empty}`, {
  flex: "1 1 auto",
  justifyContent: "center",
});

globalStyle(`${conversationBody} ${chat.emptyText}`, {
  maxWidth: 360,
  textAlign: "center",
  textWrap: "pretty",
});

export const conversationDock = style({
  position: "relative",
  zIndex: 5,
  flex: "0 0 auto",
  padding: "8px max(12px, calc((100% - 68ch) / 2)) 10px",
  "@media": {
    "(max-width: 720px)": {
      paddingRight: 8,
      paddingLeft: 8,
    },
  },
});

export const conversationDockInner = style({
  minWidth: 0,
});

export const composerWrap = style({
  position: "relative",
});

export const conversationComposer = style({
  position: "relative",
  padding: 4,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius,
  background: vars.color.bgElement,
  transitionProperty: "border-color, box-shadow",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease",
  selectors: {
    "&[data-expanded]": {
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
    "&:focus-within": {
      borderColor: vars.focus.border,
      boxShadow: vars.focus.ring,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms",
    },
  },
});

globalStyle(`${conversationComposer} ${chat.composer}`, {
  alignItems: "center",
  gap: 6,
  padding: 0,
});

globalStyle(`${conversationComposer}[data-expanded] ${chat.composer}`, {
  alignItems: "flex-end",
});

globalStyle(`${conversationComposer} ${chat.composerFieldMultiline}`, {
  ...({ fieldSizing: "content" } as object),
  minHeight: 34,
  maxHeight: 132,
  height: "auto",
  padding: "7px 8px 5px",
  resize: "none",
  overflowY: "auto",
  border: 0,
  borderRadius: 0,
  background: "transparent",
  color: vars.color.textPrimary,
  caretColor: vars.color.accent,
  fontSize: vars.fontSize.base,
  lineHeight: 1.5,
  textWrap: "pretty",
});

globalStyle(`${conversationComposer}[data-expanded] ${chat.composerFieldMultiline}`, {
  minHeight: 60,
});

globalStyle(`${conversationComposer}:focus-within ${chat.composerFieldMultiline}`, {
  minHeight: 60,
});

globalStyle(`${conversationComposer} ${chat.composerFieldMultiline}::placeholder`, {
  color: vars.color.textMuted,
});

globalStyle(`${conversationComposer} ${chat.composerFieldMultiline}:focus`, {
  border: 0,
  outline: "none",
  boxShadow: "none",
});

globalStyle(`${conversationComposer} ${chat.composerFieldMultiline}:focus-visible`, {
  border: 0,
  outline: "none",
  boxShadow: "none",
});

globalStyle(`${conversationComposer} ${chat.hint}`, {
  padding: "4px 8px 2px",
  color: vars.color.down,
  textWrap: "pretty",
});

globalStyle(`${conversationComposer} ${chat.composerAction}`, {
  position: "relative",
  width: vars.controlH,
  height: vars.controlH,
  borderRadius: vars.radius,
});

globalStyle(`${conversationComposer} ${chat.composerAction}::after`, {
  content: "",
  position: "absolute",
  left: "50%",
  top: "50%",
  width: 40,
  height: 40,
  transform: "translate(-50%, -50%)",
});

globalStyle(`${conversationComposer} ${chat.composerActionSend} svg`, {
  marginLeft: 1,
});

export const composerMeta = style({
  display: "flex",
  height: 0,
  minWidth: 0,
  minHeight: 0,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 0,
  padding: "0 4px",
  overflow: "hidden",
  borderTop: `0 solid ${vars.color.border}`,
  opacity: 0,
  transform: "translateY(4px)",
  pointerEvents: "none",
  transitionProperty: "opacity, transform",
  transitionDuration: "140ms",
  transitionTimingFunction: "ease-out",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms",
    },
  },
});

globalStyle(`${conversationComposer}[data-expanded] ${composerMeta}`, {
  height: "auto",
  minHeight: vars.controlH,
  marginTop: 4,
  paddingTop: 4,
  overflow: "visible",
  borderTopWidth: 1,
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "auto",
});

export const contextAction = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  height: vars.controlH,
  padding: "0 6px",
  border: 0,
  borderRadius: vars.radius,
  background: "transparent",
  color: vars.color.textMuted,
  cursor: "pointer",
  fontSize: vars.fontSize.xs,
  transitionProperty: "color, background-color, scale",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&:hover": {
      color: vars.color.textSecondary,
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

export const composerTools = style({
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: 4,
});

export const modelSelect = style({
  width: "min(190px, 32vw)",
  justifyContent: "space-between",
  borderColor: "transparent",
  background: "transparent",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
  selectors: {
    "&:hover:not([disabled])": {
      borderColor: vars.color.border,
      color: vars.color.textSecondary,
    },
    "&[data-popup-open]": {
      borderColor: vars.color.border,
      color: vars.color.textSecondary,
    },
  },
  "@media": {
    "(max-width: 720px)": {
      width: "min(150px, 38vw)",
    },
  },
});

export const composerStatus = style({
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: 10,
});

export const modelError = style({
  minWidth: 0,
  overflow: "hidden",
  color: vars.color.down,
  fontSize: vars.fontSize.xs,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const composerShortcut = style({
  color: vars.color.textMuted,
  fontSize: 9,
  whiteSpace: "nowrap",
  "@media": {
    "(max-width: 920px)": {
      display: "none",
    },
  },
});

globalStyle(`${composerShortcut} kbd`, {
  fontSize: "inherit",
});

export const composerReferences = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4px 12px",
  padding: "2px 2px 4px",
});

export const composerReference = style({
  display: "inline-flex",
  minWidth: 0,
  maxWidth: "min(100%, 360px)",
  height: vars.controlH,
  alignItems: "center",
  gap: 5,
  padding: "0 3px 0 7px",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  background: vars.color.bgSurface,
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.xs,
});

globalStyle(`${composerReference} > svg`, {
  flex: "0 0 auto",
  color: vars.color.accent,
});

export const composerReferenceTitle = style({
  flex: "0 0 auto",
  color: vars.color.textSecondary,
});

export const composerReferencePath = style({
  minWidth: 0,
  overflow: "hidden",
  color: vars.color.textMuted,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    "(max-width: 720px)": {
      display: "none",
    },
  },
});

globalStyle(`${composerReference} button`, {
  display: "inline-flex",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  padding: 0,
  border: 0,
  borderRadius: vars.radius,
  background: "transparent",
  color: vars.color.textMuted,
  cursor: "pointer",
  transitionProperty: "color, background-color, scale",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
});

globalStyle(`${composerReference} button:hover`, {
  color: vars.color.textPrimary,
  background: vars.color.bgHover,
});

globalStyle(`${composerReference} button:active`, {
  scale: 0.96,
});

globalStyle(`${composerReference} button`, {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms",
    },
  },
});

