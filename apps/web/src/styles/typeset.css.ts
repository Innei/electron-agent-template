import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const notTypeset =
  ":where(.not-typeset, [data-not-typeset], .not-typeset *, [data-not-typeset] *)";

export const typeset = style({
  vars: {
    "--color-foreground": vars.color.textPrimary,
    "--color-muted-foreground": vars.color.textSecondary,
    "--color-muted": vars.color.bgElement,
    "--color-border": vars.color.border,
    "--color-ring": vars.focus.border,
    "--typeset-font-body": vars.font.ui,
    "--typeset-font-heading": vars.font.ui,
    "--typeset-font-mono": vars.font.mono,
    "--typeset-size": "1em",
    "--typeset-leading": "1.75",
    "--typeset-flow": "1.25em",
    "--typeset-muted":
      "var(--color-muted-foreground, color-mix(in oklab, currentColor 60%, transparent))",
    "--typeset-rule":
      "var(--color-border, color-mix(in oklab, currentColor 20%, transparent))",
  },
  fontFamily: "var(--typeset-font-body)",
  fontSize: "var(--typeset-size)",
  lineHeight: "var(--typeset-leading)",
  color: "var(--color-foreground, currentColor)",
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  marginTrim: "block-start" as never,
});

export const typesetChat = style({
  vars: {
    "--typeset-size": vars.fontSize.base,
    "--typeset-leading": "1.6",
    "--typeset-flow": "0.8em",
    "--typeset-h1": "1.25em",
    "--typeset-h2": "1.15em",
    "--typeset-h3": "1.05em",
    "--typeset-h4": "1em",
  },
});

export const typesetReport = style({
  vars: {
    "--typeset-size": vars.fontSize.md,
    "--typeset-leading": "1.75",
    "--typeset-flow": "1.15em",
    "--typeset-h1": "1.7em",
    "--typeset-h2": "1.35em",
    "--typeset-h3": "1.15em",
    "--typeset-h4": "1em",
  },
});

const scoped = `${typeset} *:not(${notTypeset})`;

globalStyle(`${scoped}:where(p)`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(h1, h2, h3, h4, h5, h6)`, {
  color: "var(--color-foreground, currentColor)",
  fontFamily: "var(--typeset-font-heading)",
  fontWeight: 600,
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(h1)`, {
  fontSize: "var(--typeset-h1, 1.75em)",
  lineHeight: 1.3,
  marginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(h2)`, {
  fontSize: "var(--typeset-h2, 1.25em)",
  lineHeight: 1.4,
  marginBlockStart: "calc(var(--typeset-flow) * 1.4)",
});

globalStyle(`${scoped}:where(h3)`, {
  fontSize: "var(--typeset-h3, 1.125em)",
  lineHeight: 1.45,
  marginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(h4)`, {
  fontSize: "var(--typeset-h4, 1em)",
  lineHeight: 1.5,
  marginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(h5)`, {
  fontSize: "0.875em",
  lineHeight: 1.5,
  fontWeight: 500,
  color: "var(--typeset-muted)",
  marginBlockStart: "calc(var(--typeset-flow) / 0.875)",
});

globalStyle(`${scoped}:where(h6)`, {
  fontSize: "0.8125em",
  lineHeight: 1.5,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--typeset-muted)",
  marginBlockStart: "calc(var(--typeset-flow) / 0.8125)",
});

globalStyle(`${scoped}:where([id])`, {
  scrollMarginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + *)`, {
  marginBlockStart: "1em",
});

globalStyle(`${scoped}:where(:is(h1, h2, h3, h4) :is(code))`, {
  fontSize: "0.9em",
});

globalStyle(`${scoped}:where(a)`, {
  color: vars.color.accent,
  fontWeight: 500,
  textDecorationLine: "underline",
  textDecorationColor: "color-mix(in oklab, currentColor 30%, transparent)",
});

globalStyle(`${scoped}:where(a:hover)`, {
  textDecorationColor: vars.color.accent,
});

globalStyle(`${scoped}:where(a:focus-visible)`, {
  outline: "2px solid var(--color-ring, currentColor)",
  outlineOffset: "2px",
  borderRadius: "0.125em",
});

globalStyle(`${scoped}:where(:is(h1, h2, h3, h4, h5, h6) :is(a))`, {
  fontWeight: "inherit",
});

globalStyle(`${scoped}:where(strong, b)`, {
  fontWeight: 600,
});

globalStyle(`${scoped}:where(:is(h1, h2, h3, h4) :is(strong, b))`, {
  fontWeight: 600,
});

globalStyle(`${scoped}:where(mark)`, {
  backgroundColor: "color-mix(in oklab, oklch(0.86 0.17 95) 40%, transparent)",
  color: "inherit",
  padding: "0.05em 0.15em",
  borderRadius: "0.2em",
});

globalStyle(`${scoped}:where(abbr[title])`, {
  textDecorationLine: "underline",
  textDecorationStyle: "dotted",
  textUnderlineOffset: "0.2em",
  cursor: "help",
});

globalStyle(`${scoped}:where(del, s)`, {
  color: "var(--typeset-muted)",
  textDecorationLine: "line-through",
});

globalStyle(`${scoped}:where(sup, sub)`, {
  fontSize: "0.75em",
  lineHeight: 0,
  position: "relative",
  verticalAlign: "baseline",
});

globalStyle(`${scoped}:where(sup)`, {
  top: "-0.5em",
});

globalStyle(`${scoped}:where(sub)`, {
  bottom: "-0.25em",
});

globalStyle(`${scoped}:where(sup a)`, {
  textDecorationLine: "none",
  fontWeight: 500,
});

globalStyle(`${scoped}:where(ul)`, {
  listStyleType: "disc",
});

globalStyle(`${scoped}:where(ol)`, {
  listStyleType: "decimal",
});

globalStyle(`${scoped}:where(ul ul)`, {
  listStyleType: "circle",
});

globalStyle(`${scoped}:where(ul ul ul)`, {
  listStyleType: "square",
});

globalStyle(`${scoped}:where(ol[type="a" i])`, {
  listStyleType: "lower-alpha",
});

globalStyle(`${scoped}:where(ol[type="i" i])`, {
  listStyleType: "lower-roman",
});

globalStyle(`${scoped}:where(ol[type="A" s])`, {
  listStyleType: "upper-alpha",
});

globalStyle(`${scoped}:where(ol[type="I" s])`, {
  listStyleType: "upper-roman",
});

globalStyle(`${scoped}:where(ul, ol)`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
  paddingInlineStart: "1.5em",
});

globalStyle(`${scoped}:where(li)`, {
  marginBlockStart: "0.5em",
  paddingInlineStart: "0.4em",
});

globalStyle(`${scoped}:where(li > p, li > ul, li > ol)`, {
  marginBlockStart: "0.5em",
});

globalStyle(`${scoped}:where(ul > li)::marker`, {
  color: "var(--typeset-muted)",
});

globalStyle(`${scoped}:where(ol > li)::marker`, {
  color: "var(--typeset-muted)",
});

globalStyle(`${scoped}:where(ul.contains-task-list)`, {
  listStyleType: "none",
  paddingInlineStart: "0.25em",
});

globalStyle(`${scoped}:where(li.task-list-item > input[type="checkbox"])`, {
  marginInlineEnd: "0.5em",
  verticalAlign: "-0.1em",
  accentColor: "var(--color-primary, currentColor)",
});

globalStyle(`${scoped}:where(details)`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(summary)`, {
  cursor: "pointer",
  fontWeight: 500,
});

globalStyle(`${scoped}:where(summary)::marker`, {
  color: "var(--typeset-muted)",
});

globalStyle(`${scoped}:where(kbd)`, {
  fontFamily: "inherit",
  fontSize: "0.85em",
  fontWeight: 500,
  border: "1px solid var(--typeset-rule)",
  borderBlockEndWidth: "2px",
  borderRadius: `min(calc(${vars.radius} * 0.6), 0.35em)`,
  padding: "0.0625em 0.35em",
});

globalStyle(`${scoped}:where(dl)`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(dt)`, {
  fontWeight: 500,
  marginBlockStart: "1em",
});

globalStyle(`${scoped}:where(dt + dt)`, {
  marginBlockStart: "0.25em",
});

globalStyle(`${scoped}:where(dd)`, {
  marginBlockStart: "0.25em",
  marginInlineStart: 0,
  paddingInlineStart: "1em",
  color: "var(--typeset-muted)",
});

globalStyle(`${scoped}:where(:not(pre) > code)`, {
  backgroundColor:
    "var(--color-muted, color-mix(in oklab, currentColor 8%, transparent))",
  fontFamily: "var(--typeset-font-mono)",
  fontSize: "0.85em",
  borderRadius: `min(calc(${vars.radius} * 0.6), 0.35em)`,
  padding: "0.125em 0.3em",
});

globalStyle(`${scoped}:where(pre)`, {
  backgroundColor:
    "var(--color-muted, color-mix(in oklab, currentColor 8%, transparent))",
  fontFamily: "var(--typeset-font-mono)",
  fontSize: "0.875em",
  lineHeight: 1.5,
  tabSize: 2,
  direction: "ltr",
  borderRadius: vars.radius,
  border: `1px solid ${vars.color.border}`,
  padding: "0.75em 1em",
  overflowX: "auto",
  marginBlockStart: "calc(var(--typeset-flow) / 0.875)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(pre code)`, {
  backgroundColor: "transparent",
  fontFamily: "inherit",
  fontSize: "inherit",
  padding: 0,
  borderRadius: 0,
});

globalStyle(`${scoped}:where(blockquote)`, {
  borderInlineStart: "2px solid var(--typeset-rule)",
  paddingInlineStart: "1em",
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
  marginInline: 0,
});

globalStyle(`${scoped}:where(hr)`, {
  border: 0,
  borderBlockStart: "1px solid var(--typeset-rule)",
  marginBlockStart: "calc(var(--typeset-flow) * 2.4)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(hr + h1, hr + h2, hr + h3, hr + h4)`, {
  marginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(.footnotes, [data-footnotes])`, {
  marginBlockStart: "calc(var(--typeset-flow) * 2)",
  borderBlockStart: "1px solid var(--typeset-rule)",
  paddingBlockStart: "var(--typeset-flow)",
  fontSize: "0.875em",
  color: "var(--typeset-muted)",
});

globalStyle(`${scoped}:where(math[display="block"])`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
  overflowX: "auto",
  overflowY: "hidden",
  paddingBlock: "0.25em",
});

globalStyle(`${scoped}:where(img, video)`, {
  borderRadius: vars.radius,
  maxWidth: "100%",
  height: "auto",
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(p img)`, {
  marginBlockStart: 0,
});

globalStyle(`${scoped}:where(figure)`, {
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
  marginInline: 0,
});

globalStyle(`${scoped}:where(figcaption, caption)`, {
  color: "var(--typeset-muted)",
  fontSize: "0.875em",
  textAlign: "center",
  marginBlockStart: "calc(0.75em / 0.875)",
});

globalStyle(`${scoped}:where(caption)`, {
  captionSide: "bottom",
});

globalStyle(`${scoped}:where(table)`, {
  maxWidth: "100%",
  fontSize: "1em",
  lineHeight: 1.5,
  fontVariantNumeric: "tabular-nums",
  borderCollapse: "separate",
  borderSpacing: 0,
  borderBlockEnd: "1px solid var(--typeset-rule)",
  marginBlockStart: "var(--typeset-flow)",
  marginBlockEnd: 0,
});

globalStyle(`${scoped}:where(.typeset-scroll)`, {
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  marginBlockStart: "var(--typeset-flow)",
});

globalStyle(`${scoped}:where(.typeset-scroll > *)`, {
  marginBlockStart: 0,
});

globalStyle(`${scoped}:where(.typeset-scroll table)`, {
  width: "max-content",
  maxWidth: "none",
});

globalStyle(`${scoped}:where(thead th)`, {
  fontWeight: 600,
  textAlign: "start",
  whiteSpace: "nowrap",
  padding: "0.65em 1em",
  color: vars.color.textPrimary,
});

globalStyle(`${scoped}:where(:is(tbody, tfoot) :is(td, th))`, {
  padding: "0.75em 1em",
  textAlign: "start",
  verticalAlign: "top",
  borderBlockStart: "1px solid var(--typeset-rule)",
});

globalStyle(`${scoped}:where(tbody th, tfoot th)`, {
  fontWeight: 500,
});

globalStyle(`${scoped}:where(th:first-child, td:first-child)`, {
  paddingInlineStart: 0,
});

globalStyle(`${scoped}:where(th[align="center"], td[align="center"])`, {
  textAlign: "center",
});

globalStyle(`${scoped}:where(th[align="right"], td[align="right"])`, {
  textAlign: "end",
});

globalStyle(`${scoped}:where(li > blockquote, li > table, li > figure)`, {
  marginBlockStart: "0.5em",
});

globalStyle(`${scoped}:where(li > pre)`, {
  marginBlockStart: "calc(0.5em / 0.875)",
});

globalStyle(`${scoped}:where(pre, table, blockquote, figure)`, {
  "@media": {
    print: {
      breakInside: "avoid",
    },
  },
});

globalStyle(`${scoped}:where(h1, h2, h3, h4)`, {
  "@media": {
    print: {
      breakAfter: "avoid",
    },
  },
});

globalStyle(`${scoped}:where(:not(pre) > code)`, {
  "@media": {
    "(forced-colors: active)": {
      border: "1px solid",
    },
  },
});

globalStyle(
  [
    `${typeset} > :where(:first-child):not(${notTypeset})`,
    `${typeset} > :where(:first-child) > :where(:first-child):not(${notTypeset})`,
    `${typeset} :where(li > :first-child, blockquote > :first-child, td > :first-child, th > :first-child, dd > :first-child, figure > :first-child, figure > picture > img):not(${notTypeset})`,
  ].join(", "),
  {
    marginBlockStart: 0,
  },
);

globalStyle(`${scoped}:where(a.app-deep-link)`, {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  width: "auto",
  maxWidth: "min(440px, 100%)",
  margin: "1px 0 1px 4px",
  padding: "2px 5px 2px 3px",
  verticalAlign: "middle",
  color: vars.color.textPrimary,
  background: "transparent",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  textDecoration: "none",
  transition:
    "border-color 120ms ease, background-color 120ms ease, transform 120ms ease",
});

globalStyle(
  `${scoped}:where(a.app-deep-link:hover), ${scoped}:where(a.app-deep-link:focus-visible)`,
  {
    color: vars.color.textPrimary,
    background: vars.color.bgElement,
    borderColor: "rgba(255, 176, 0, 0.55)",
    outline: "none",
    textDecoration: "none",
    transform: "translateX(1px)",
  },
);

globalStyle(".app-deep-link-icon", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: 20,
  height: 20,
  color: vars.color.accent,
  background: "rgba(255, 176, 0, 0.07)",
  border: "1px solid rgba(255, 176, 0, 0.18)",
  borderRadius: vars.radius,
});

globalStyle(".app-deep-link-content", {
  display: "flex",
  alignItems: "baseline",
  flex: "1 1 auto",
  minWidth: 0,
  gap: 6,
  overflow: "hidden",
  lineHeight: 1.25,
  whiteSpace: "nowrap",
});

globalStyle(".app-deep-link-title", {
  flex: "0 0 auto",
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
});

globalStyle(".app-deep-link-meta", {
  display: "flex",
  alignItems: "baseline",
  minWidth: 0,
  gap: 5,
  overflow: "hidden",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.xs,
});

globalStyle(".app-deep-link-meta::before", {
  content: '"·"',
  color: vars.color.textMuted,
});

globalStyle(".app-deep-link-meta span:first-child", {
  flex: "0 0 auto",
  color: vars.color.textSecondary,
  fontFamily: vars.font.mono,
});

globalStyle(".app-deep-link-meta span + span", {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

globalStyle(".app-deep-link-arrow", {
  flex: "0 0 auto",
  color: vars.color.textMuted,
  transition: "color 120ms ease, transform 120ms ease",
});

globalStyle(
  ".app-deep-link:hover .app-deep-link-arrow, .app-deep-link:focus-visible .app-deep-link-arrow",
  {
    color: vars.color.accent,
    transform: "translateX(2px)",
  },
);

globalStyle(`.research-reader-body ${typesetReport}`, {
  vars: {
    "--typeset-size": vars.fontSize.md,
    "--typeset-leading": "1.8",
  },
});
