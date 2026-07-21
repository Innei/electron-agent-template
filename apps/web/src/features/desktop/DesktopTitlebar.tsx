import { useEffect, useState } from "react";
import {
  ArrowUpCircle,
  Circle,
  House,
  MessageCircle,
  ScrollText,
  Settings,
  X,
} from "lucide-react";
import { useHubStatus } from "../../lib/ws/useHubStatus";
import type { HubStatus } from "../../lib/ws/wsHub";
import { Dot, ScrollArea, showContextMenu, Tooltip, type ContextMenuItem } from "../../ui";
import {
  getDesktopUpdaterBridge,
  isAvailableStatus,
  type UpdaterUiStatus,
} from "./desktopUpdater";
import { tabKind, type TabState } from "./tabsStore";
import type { TabsController } from "./tabsController";
import { NewTabLauncher } from "./NewTabLauncher";
import * as s from "./DesktopTitlebar.css";

const TAB_ICONS: Record<ReturnType<typeof tabKind>, typeof House> = {
  home: House,
  chat: MessageCircle,
  settings: Settings,
  logs: ScrollText,
  other: Circle,
};

function TabIcon({ route }: { route: string }) {
  const Icon = TAB_ICONS[tabKind(route)];
  return (
    <span className={s.tabIconWrap}>
      <Icon className={s.tabIcon} size={12} />
    </span>
  );
}

const HUB_STATUS_META: Record<HubStatus, { label: string; tone?: "accent" | "ok"; pulse?: boolean; dim?: boolean }> = {
  connected: { label: "Market data connected", tone: "ok" },
  connecting: { label: "Connecting market data…", tone: "accent" },
  reconnecting: { label: "Market data disconnected, reconnecting…", tone: "accent", pulse: true },
  idle: { label: "Market data idle (no subscriptions on this page)", dim: true },
};

function HubStatusDot() {
  const status = useHubStatus();
  const meta = HUB_STATUS_META[status];
  return (
    <Tooltip content={meta.label} placement="bottom">
      <span className={[s.hubStatus, meta.dim ? s.hubStatusDim : null].filter(Boolean).join(" ")}>
        <Dot tone={meta.tone} pulse={meta.pulse} aria-label={meta.label} role="status" />
      </span>
    </Tooltip>
  );
}

function Tab({
  tab,
  active,
  closable,
  onActivate,
  onClose,
  onContextMenu,
}: {
  tab: TabState;
  active: boolean;
  closable: boolean;
  onActivate: () => void;
  onClose: () => void;
  onContextMenu: () => void;
}) {
  return (
    <button
      type="button"
      className={[s.tab, active ? s.tabActive : null].filter(Boolean).join(" ")}
      onClick={onActivate}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu();
      }}
    >
      <TabIcon route={tab.route} />
      <span className={s.tabTitle}>{tab.title}</span>
      {closable && (
        <span
          className={s.tabClose}
          role="button"
          aria-label="Close tab"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <X size={11} />
        </span>
      )}
    </button>
  );
}

function useUpdaterStatus(): UpdaterUiStatus | null {
  const [status, setStatus] = useState<UpdaterUiStatus | null>(null);

  useEffect(() => {
    const bridge = getDesktopUpdaterBridge();
    if (!bridge) return;
    let cancelled = false;
    void bridge.getStatus().then((next) => {
      if (!cancelled) setStatus(next);
    });
    const unsubscribe = bridge.onStatus((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return status;
}

export function DesktopTitlebar({
  controller,
}: {
  controller: TabsController;
}) {
  const {
    snapshot,
    activateTab,
    closeTabById,
    closeOtherTabs,
    closeTabsToRight,
    openHomeTab,
    focusOrOpenHome,
    focusOrOpenSettings,
    focusOrOpenChat,
  } = controller;
  const updaterStatus = useUpdaterStatus();
  const showUpdateBadge = isAvailableStatus(updaterStatus);

  const openTabMenu = (tabId: string, index: number) => {
    const multi = snapshot.tabs.length > 1;
    const isLast = index === snapshot.tabs.length - 1;
    const items: ContextMenuItem[] = [
      {
        key: "close",
        label: "Close Tab",
        accelerator: "CmdOrCtrl+W",
        disabled: !multi,
        onClick: () => closeTabById(tabId),
      },
      {
        key: "close-others",
        label: "Close Other Tabs",
        disabled: !multi,
        onClick: () => closeOtherTabs(tabId),
      },
      {
        key: "close-right",
        label: "Close Tabs to the Right",
        disabled: isLast,
        onClick: () => closeTabsToRight(tabId),
      },
      { type: "divider" },
      {
        key: "new",
        label: "New Tab",
        accelerator: "CmdOrCtrl+T",
        onClick: openHomeTab,
      },
    ];
    showContextMenu(items);
  };

  return (
    <div className={s.titlebar}>
      <div className={s.trafficSpacer} />
      <ScrollArea
        className={s.tabstrip}
        viewportClassName={s.tabstripViewport}
        contentClassName={s.tabstripContent}
        orientation="horizontal"
      >
        {snapshot.tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            tab={tab}
            active={tab.id === snapshot.activeTabId}
            closable={snapshot.tabs.length > 1}
            onActivate={() => activateTab(tab.id)}
            onClose={() => closeTabById(tab.id)}
            onContextMenu={() => openTabMenu(tab.id, index)}
          />
        ))}
        <NewTabLauncher
          onOpenHome={focusOrOpenHome}
          onOpenChat={focusOrOpenChat}
        />
      </ScrollArea>
      <div className={s.actions}>
        {showUpdateBadge && (
          <button
            className={s.updateBadge}
            type="button"
            aria-label="Update available"
            title="Update available"
            onClick={() => {
              void getDesktopUpdaterBridge()?.installNow();
            }}
          >
            <ArrowUpCircle size={16} />
          </button>
        )}
        <button
          className={[
            s.settings,
            tabKind(controller.activeTab.route) === "settings" ? s.settingsActive : null,
          ]
            .filter(Boolean)
            .join(" ")}
          type="button"
          aria-label="Settings"
          title="Settings (⌘,)"
          onClick={focusOrOpenSettings}
        >
          <span className={s.actionVisual}>
            <Settings size={14} />
          </span>
        </button>
        <HubStatusDot />
      </div>
    </div>
  );
}
