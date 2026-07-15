import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const root = style({
  position: "relative",
  minWidth: 0,
  minHeight: 0,
});

export const viewport = style({
  width: "100%",
  height: "100%",
  outline: "none",
  selectors: {
    [`${root}[data-orientation="horizontal"] > &`]: {
      overflowX: "auto",
      overflowY: "hidden",
    },
    [`${root}[data-orientation="vertical"] > &`]: {
      overflowY: "auto",
      overflowX: "hidden",
    },
  },
});

export const scrollbar = style({
  opacity: 0,
  transition: "opacity 0.15s ease",
  selectors: {
    '&[data-orientation="horizontal"]': {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
    },
    '&[data-orientation="vertical"]': {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: 3,
    },
    "&[data-hovering]": {
      opacity: 1,
    },
    "&[data-scrolling]": {
      opacity: 1,
    },
  },
});

export const thumb = style({
  width: "var(--scroll-area-thumb-width)",
  height: "var(--scroll-area-thumb-height)",
  background: vars.color.borderStrong,
  borderRadius: 999,
});
