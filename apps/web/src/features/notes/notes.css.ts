import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const notesPage = style({
  padding: 16,
});

export const layout = style({
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
});

export const sidebar = style({
  flex: "0 0 260px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
});

export const sidebarHead = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
});

globalStyle(`${sidebarHead} h1`, {
  margin: 0,
  fontSize: vars.fontSize.xl,
});

export const list = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const listItem = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "8px 10px",
  textAlign: "left",
  background: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: vars.color.borderStrong,
    },
  },
});

export const listItemActive = style({
  borderColor: vars.color.accent,
});

export const listTitle = style({
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const listTime = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
});

export const main = style({
  flex: 1,
  minWidth: 0,
});

export const editor = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 14,
});

export const editorBody = style({
  width: "100%",
  resize: "vertical",
  background: vars.color.bgElement,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  color: vars.color.textPrimary,
  font: "inherit",
  padding: "8px 10px",
  minHeight: 240,
});

export const editorActions = style({
  display: "flex",
  gap: 8,
});
