import { style } from "@vanilla-extract/css";
import { appRegionDrag } from "../styles/electron.css";
import { vars } from "../styles/theme.css";

export const dragBar = style([
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
    background: vars.color.bgCanvas,
  },
]);

export const page = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  maxWidth: "none",
  width: "100%",
  margin: 0,
  padding: "40px 24px 24px",
  background: vars.color.bgCanvas,
});

export const shell = style({
  maxWidth: 480,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
});
