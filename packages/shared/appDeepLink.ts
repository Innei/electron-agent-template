const RELATIVE_APP_ORIGIN = "https://app.internal";
const LOCAL_APP_HOSTS = new Set(["localhost", "127.0.0.1"]);
const APP_PORT = "5199";

export interface AppDeepLink {
  route: string;
}

function isKnownAppOrigin(url: URL, relative: boolean): boolean {
  if (relative) return url.origin === RELATIVE_APP_ORIGIN;
  if (url.protocol === "app:" && url.host === "-") return true;
  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    LOCAL_APP_HOSTS.has(url.hostname) &&
    url.port === APP_PORT
  );
}

export function parseAppDeepLink(href: string | undefined): AppDeepLink | null {
  if (!href) return null;
  const relative = href.startsWith("/");
  let url: URL;
  try {
    url = new URL(href, relative ? RELATIVE_APP_ORIGIN : undefined);
  } catch {
    return null;
  }
  if (!isKnownAppOrigin(url, relative)) return null;
  const route = `${url.pathname}${url.search}`;
  return route.startsWith("/") ? { route } : null;
}
