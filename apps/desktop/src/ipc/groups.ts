export const IPC_GROUPS = ["assistant", "notes", "settings", "health"] as const;

export type IpcGroup = (typeof IPC_GROUPS)[number];
