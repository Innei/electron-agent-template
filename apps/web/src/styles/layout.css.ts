import { globalStyle, style } from "@vanilla-extract/css";

export const fullpage = style({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

globalStyle(`${fullpage} .detail-body`, {
  flex: 1,
  minHeight: 0,
});
