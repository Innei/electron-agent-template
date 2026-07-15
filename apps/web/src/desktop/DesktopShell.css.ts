import { globalStyle, style } from "@vanilla-extract/css";
import { fullpage } from "../styles/layout.css";

export const content = style({
  paddingTop: 40,
});

globalStyle(`${content} ${fullpage}`, {
  height: "calc(100vh - 40px)",
});
