import { desc, eq } from "drizzle-orm";
import type { Note, NotesApi } from "../../contract/notes.js";
import { getDb } from "../../db/index.js";
import { notes } from "../../db/schema.js";
import { nextSnowflake } from "../../db/snowflake.js";
import { ClientError } from "../../errors.js";
import { emitNotesChanged } from "./notes.events.js";

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 100_000;

function toNote(row: typeof notes.$inferSelect): Note {
  return { id: row.id, title: row.title, body: row.body, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

async function requireNote(id: string): Promise<typeof notes.$inferSelect> {
  const rows = await getDb().select().from(notes).where(eq(notes.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new ClientError(`note not found: ${id}`, "GET /api/notes lists available ids", 404);
  return row;
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) throw new ClientError("title must not be empty", undefined, 400);
  if (trimmed.length > MAX_TITLE_LENGTH) throw new ClientError(`title too long (max ${MAX_TITLE_LENGTH})`, undefined, 400);
  return trimmed;
}

function validateBody(body: string): string {
  if (body.length > MAX_BODY_LENGTH) throw new ClientError(`body too long (max ${MAX_BODY_LENGTH})`, undefined, 400);
  return body;
}

export const notesService: NotesApi = {
  async list() {
    const rows = await getDb().select().from(notes).orderBy(desc(notes.updatedAt));
    return { notes: rows.map(toNote) };
  },

  async get(input) {
    return { note: toNote(await requireNote(input.id)) };
  },

  async create(input) {
    const now = new Date().toISOString();
    const row: typeof notes.$inferInsert = {
      id: nextSnowflake(),
      title: validateTitle(input.title),
      body: validateBody(input.body ?? ""),
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(notes).values(row);
    emitNotesChanged({ noteId: row.id, action: "created" });
    return { note: { id: row.id, title: row.title, body: row.body, createdAt: now, updatedAt: now } };
  },

  async update(input) {
    const existing = await requireNote(input.id);
    const now = new Date().toISOString();
    const next = {
      title: input.title !== undefined ? validateTitle(input.title) : existing.title,
      body: input.body !== undefined ? validateBody(input.body) : existing.body,
      updatedAt: now,
    };
    await getDb().update(notes).set(next).where(eq(notes.id, input.id));
    emitNotesChanged({ noteId: input.id, action: "updated" });
    return { note: { id: existing.id, createdAt: existing.createdAt, ...next } };
  },

  async remove(input) {
    await requireNote(input.id);
    await getDb().delete(notes).where(eq(notes.id, input.id));
    emitNotesChanged({ noteId: input.id, action: "deleted" });
    return { ok: true };
  },
};
