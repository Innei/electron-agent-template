import { IpcMethod, IpcService } from "electron-ipc-decorator";
import type { NotesApi } from "../../../../packages/core/src/contract/index.js";
import { notesService } from "../../../../packages/core/src/modules/notes/notes.service.js";
import { toEnvelope, type WrapEnvelope } from "./envelope.js";

export class NotesIpc extends IpcService implements WrapEnvelope<NotesApi> {
  static readonly groupName = "notes";

  @IpcMethod()
  list() {
    return toEnvelope("notes.list", () => notesService.list());
  }

  @IpcMethod()
  get(input: Parameters<NotesApi["get"]>[0]) {
    return toEnvelope("notes.get", () => notesService.get(input));
  }

  @IpcMethod()
  create(input: Parameters<NotesApi["create"]>[0]) {
    return toEnvelope("notes.create", () => notesService.create(input));
  }

  @IpcMethod()
  update(input: Parameters<NotesApi["update"]>[0]) {
    return toEnvelope("notes.update", () => notesService.update(input));
  }

  @IpcMethod()
  remove(input: Parameters<NotesApi["remove"]>[0]) {
    return toEnvelope("notes.remove", () => notesService.remove(input));
  }
}
