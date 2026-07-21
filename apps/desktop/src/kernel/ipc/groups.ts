export const KERNEL_IPC_GROUPS = ["assistant", "notes", "settings", "health"] as const;

export const SHELL_IPC_GROUPS = [
  "onboarding",
  "dataRoot",
  "logs",
  "contextMenu",
  "updater",
] as const;

export const IPC_GROUPS = [...KERNEL_IPC_GROUPS, ...SHELL_IPC_GROUPS] as const;

export type IpcGroup = (typeof IPC_GROUPS)[number];
