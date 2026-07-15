import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseAppDeepLink } from "../../../../packages/shared/appDeepLink";
import { navigate } from "../router";

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
    <div className={variant === "chat" ? "markdown markdown-chat" : "markdown markdown-report"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
