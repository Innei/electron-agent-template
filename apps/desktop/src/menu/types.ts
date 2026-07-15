export type MenuActionDeps = {
  selectDataRoot: () => void;
  openSettings: () => void;
  openLogs: () => void;
  openChat: () => void;
  checkForUpdates: () => void;
  newTab: () => void;
  closeTab: () => void;
  nextTab: () => void;
  prevTab: () => void;
};

export type AppMenuManager = {
  install: () => void;
  rebuild: () => void;
};
