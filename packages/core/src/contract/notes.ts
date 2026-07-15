import { defineRoutes } from "./defineRoutes.js";

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesApi {
  list(): Promise<{ notes: Note[] }>;
  get(input: { id: string }): Promise<{ note: Note }>;
  create(input: { title: string; body?: string }): Promise<{ note: Note }>;
  update(input: { id: string; title?: string; body?: string }): Promise<{ note: Note }>;
  remove(input: { id: string }): Promise<{ ok: true }>;
}

export const notesRoutes = defineRoutes<NotesApi>("notes", {
  list: { method: "GET", path: "/" },
  get: { method: "GET", path: "/:id" },
  create: { method: "POST", path: "/" },
  update: { method: "PATCH", path: "/:id" },
  remove: { method: "DELETE", path: "/:id" },
});
