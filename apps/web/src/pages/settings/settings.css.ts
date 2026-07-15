import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const settingsPage = style({
  maxWidth: 1180,
  "@media": {
    "(max-width: 560px)": {
      paddingInline: 12,
    },
  },
});

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.sm,
  marginBottom: 8,
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
    },
  },
});

export const pageSubtitle = style({
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  marginBottom: 16,
});

export const loadError = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

export const statusline = style({
  display: "flex",
  alignItems: "baseline",
  gap: 10,
  marginBottom: 12,
  padding: "0 2px",
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.sm,
  "@media": {
    "(max-width: 560px)": {
      flexWrap: "wrap",
    },
  },
});

export const statuslineState = style({
  fontWeight: 600,
});

export const statuslineStateTone = styleVariants({
  up: { color: vars.color.up },
  accent: { color: vars.color.accent },
  down: { color: vars.color.down },
});

export const statuslineSep = style({
  color: vars.color.textMuted,
});

export const statuslineUsage = style({
  display: "inline-flex",
  alignItems: "baseline",
  gap: 8,
  marginLeft: "auto",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const statuslineRetry = style({
  padding: 0,
  border: "none",
  background: "none",
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.xs,
  cursor: "pointer",
  textDecoration: "underline",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
    },
  },
});

export const workspace = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(300px, 1fr)",
  gap: 12,
  alignItems: "start",
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const column = style({
  display: "grid",
  minWidth: 0,
  gap: 12,
});

export const cardFlush = style({
  overflow: "hidden",
  padding: 0,
  minWidth: 0,
  marginBottom: 0,
});

export const cardHeading = style({
  display: "flex",
  minHeight: 34,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "0 11px",
  borderBottom: `1px solid ${vars.color.border}`,
});

globalStyle(`${cardHeading} > :first-child`, {
  margin: 0,
});

globalStyle(`${cardHeading} > span`, {
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
});

export const primaryRow = style({
  padding: 11,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const primaryHead = style({
  display: "flex",
  minHeight: 28,
  alignItems: "center",
  gap: 8,
});

export const roleName = style({
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
});

globalStyle(`${primaryHead} ${roleName}`, {
  minWidth: 78,
});

export const primaryEditor = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 8,
  flexWrap: "wrap",
});

export const select = style({
  minWidth: 112,
  justifyContent: "space-between",
});

export const selectWide = style({
  minWidth: 160,
  justifyContent: "space-between",
});

export const primaryClear = style({
  padding: "0 4px",
  border: "none",
  background: "none",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.sm,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      color: vars.color.down,
    },
  },
});

export const roleList = style({
  minWidth: 0,
});

export const assignmentRow = style({
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const assignmentRowDisabled = style({});

export const roleSummary = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 14,
  minHeight: 67,
  padding: "10px 11px",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
      gap: 9,
    },
  },
});

export const roleCopy = style({
  minWidth: 0,
});

export const roleHeading = style({
  display: "flex",
  alignItems: "baseline",
  gap: 10,
});

globalStyle(`${assignmentRowDisabled} ${roleName}`, {
  color: vars.color.textSecondary,
});

export const roleMode = style({
  width: 210,
  height: 26,
  gridTemplateColumns: "1.35fr 1fr 0.75fr",
  "@media": {
    "(max-width: 560px)": {
      width: "min(100%, 260px)",
    },
  },
});

export const roleEffective = style({
  overflow: "hidden",
  marginTop: 4,
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.sm,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const roleEffectiveTone = styleVariants({
  muted: { color: vars.color.textMuted },
  warning: { color: vars.color.accent },
  error: { color: vars.color.down },
});

export const roleUsage = style({
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

export const roleActions = style({
  display: "flex",
  alignItems: "center",
  gap: 9,
  "@media": {
    "(max-width: 560px)": {
      justifyContent: "space-between",
    },
  },
});

export const roleStatus = style({
  display: "inline-flex",
  minWidth: 16,
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 5,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const roleStatusRollback = style({
  color: vars.color.down,
});

export const roleEditor = style({
  margin: "0 11px 11px",
  padding: "1px 0 1px 12px",
  borderLeft: `2px solid ${vars.color.borderStrong}`,
});

export const roleEdit = style({
  marginLeft: 8,
  padding: 0,
  border: "none",
  background: "none",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
    },
    "&[disabled]": {
      color: vars.color.textMuted,
      cursor: "default",
      opacity: 0.5,
    },
  },
});

export const roleEditDone = style({
  marginLeft: 2,
  fontSize: vars.fontSize.sm,
});

export const roleEditorControls = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
});

export const roleEditorStatus = style({
  display: "flex",
  minHeight: 16,
  alignItems: "center",
  gap: 8,
  marginTop: 6,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

export const saveError = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  margin: "0 11px 10px",
  padding: "6px 8px",
  borderLeft: `2px solid ${vars.color.down}`,
  background: vars.color.bgElement,
  color: vars.color.down,
  fontSize: vars.fontSize.sm,
});

export const roleWarning = style({
  color: vars.color.accent,
  fontSize: vars.fontSize.sm,
});

export const testResult = style({
  fontSize: vars.fontSize.sm,
});

export const testResultOk = style({
  color: vars.color.up,
});

export const testResultFail = style({
  color: vars.color.down,
});

export const warningStrip = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  margin: 10,
  padding: "8px 9px",
  border: `1px solid ${vars.color.down}`,
  background: vars.color.bgElement,
  color: vars.color.down,
  fontSize: vars.fontSize.sm,
});

export const connSection = style({
  padding: "10px 11px",
  selectors: {
    "& + &": {
      borderTop: `1px solid ${vars.color.border}`,
    },
  },
});

export const connTitle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
});

export const connSummary = style({
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  fontVariantNumeric: "tabular-nums",
  fontWeight: 400,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const providerRow = style({
  padding: "10px 11px",
  borderTop: `1px solid ${vars.color.border}`,
  selectors: {
    "&:first-child": {
      borderTop: "none",
    },
  },
});

export const providerHead = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const providerName = style({
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
});

export const providerState = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  marginLeft: "auto",
  fontSize: vars.fontSize.xs,
  whiteSpace: "nowrap",
});

export const providerStateTone = styleVariants({
  up: { color: vars.color.up },
  accent: { color: vars.color.accent },
  down: { color: vars.color.down },
  muted: { color: vars.color.textMuted },
});

export const providerMeta = style({
  overflowWrap: "anywhere",
  marginTop: 3,
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
});

export const providerActions = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 8,
});

export const providerEditor = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 8,
  "@media": {
    "(max-width: 560px)": {
      alignItems: "stretch",
      flexDirection: "column",
    },
  },
});

globalStyle(`${providerEditor} input`, {
  minWidth: 0,
  flex: 1,
});

globalStyle(`${providerEditor} button`, {
  "@media": {
    "(max-width: 560px)": {
      justifyContent: "center",
    },
  },
});

export const providerAdd = style({
  display: "grid",
  gridTemplateColumns: "minmax(94px, 0.8fr) minmax(120px, 1fr) auto",
  alignItems: "center",
  gap: 6,
  padding: "10px 11px",
  borderTop: `1px solid ${vars.color.border}`,
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const providerAddSelect = style({
  justifyContent: "space-between",
});

globalStyle(`${providerAdd} input`, {
  minWidth: 0,
  width: "100%",
});

export const providerError = style({
  marginTop: 7,
  paddingLeft: 7,
  borderLeft: `2px solid ${vars.color.down}`,
  color: vars.color.down,
  fontSize: vars.fontSize.sm,
  overflowWrap: "anywhere",
});

globalStyle(`${providerAdd} ${providerError}`, {
  gridColumn: "1 / -1",
  "@media": {
    "(max-width: 560px)": {
      gridColumn: "auto",
    },
  },
});

export const credActions = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: 6,
  marginTop: 12,
});
