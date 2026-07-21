type ContextMenuParams = {
  isEditable: boolean;
  selectionText: string;
  mediaType: string;
  linkURL: string;
};

export function shouldShowDefaultMenu(
  _event: unknown,
  params: ContextMenuParams,
): boolean {
  if (params.isEditable) return true;
  if (params.selectionText.trim().length > 0) return true;
  if (params.mediaType === "image" || params.mediaType === "video") return true;
  if (params.linkURL) return true;
  return false;
}

export async function installDefaultContextMenu(): Promise<() => void> {
  const { default: contextMenu } = await import("electron-context-menu");
  const isDev = process.env.ELECTRON_DEV === "1";

  return contextMenu({
    showSearchWithGoogle: false,
    showLookUpSelection: true,
    showLearnSpelling: true,
    showCopyImage: true,
    showCopyLink: true,
    showInspectElement: isDev,
    shouldShowMenu: shouldShowDefaultMenu,
    labels: {
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      selectAll: "Select All",
      copyLink: "Copy Link",
      copyImage: "Copy Image",
      copyImageAddress: "Copy Image Address",
      saveImage: "Save Image",
      saveImageAs: "Save Image As…",
      lookUpSelection: "Look Up “{selection}”",
      learnSpelling: "Learn Spelling “{selection}”",
      inspect: "Inspect Element",
      services: "Services",
    },
  });
}
