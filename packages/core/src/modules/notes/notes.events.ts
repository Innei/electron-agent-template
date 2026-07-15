export interface NotesChangedEvent {
  noteId: string;
  action: "created" | "updated" | "deleted";
}

const listeners = new Set<(event: NotesChangedEvent) => void>();

export function onNotesChanged(listener: (event: NotesChangedEvent) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitNotesChanged(event: NotesChangedEvent): void {
  for (const listener of listeners) listener(event);
}
