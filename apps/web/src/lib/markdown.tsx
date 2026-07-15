import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseAppDeepLink } from "../../../../packages/shared/appDeepLink";
import { navigate } from "../router";
import * as s from "../styles/typeset.css";

type MarkdownVariant = "chat" | "report";

function MarkdownLink({ href, children }: ComponentPropsWithoutRef<"a">) {
  const appLink = parseAppDeepLink(href);
  if (!appLink) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <a
      href={appLink.route}
      onClick={(event) => {
        event.preventDefault();
        navigate(appLink.route);
      }}
    >
      {children}
    </a>
  );
}

const components: Components = {
  a: MarkdownLink,
};

export function Markdown({ children, variant = "chat" }: { children: string; variant?: MarkdownVariant }) {
  return (
    <div className={variant === "chat" ? `${s.typeset} ${s.typesetChat}` : `${s.typeset} ${s.typesetReport}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
