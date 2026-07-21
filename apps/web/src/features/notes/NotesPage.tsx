import { useEffect, useMemo, useState } from "react";
import type { Note } from "../../../../../packages/core/src/contract";
import { errorMessage } from "../../lib/api";
import { useQuery } from "../../lib/apiHooks";
import { client } from "../../lib/client";
import { navigate, useQueryParam } from "../../router";
import { Button, Card, Empty, ErrorBox, Input, Spinner } from "../../ui";
import { page } from "../../styles/layout.css";
import { useTitle } from "../../lib/useTitle";
import * as s from "./notes.css";
import { subscribeChannel } from "../../lib/ws/wsHub";

function noteRoute(id: string | null): string {
  return id ? `/?note=${encodeURIComponent(id)}` : "/";
}

function NoteEditor({ note, onSaved, onDeleted }: { note: Note; onSaved: () => void; onDeleted: () => void }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setError(null);
  }, [note.id, note.updatedAt]);

  const dirty = title !== note.title || body !== note.body;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.notes.update({ id: note.id, title, body });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.notes.remove({ id: note.id });
      onDeleted();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Card className={s.editor}>
      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" aria-label="Note title" />
      <textarea
        className={s.editorBody}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write something…"
        aria-label="Note body"
        rows={16}
      />
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      <div className={s.editorActions}>
        <Button accent disabled={busy || !dirty || !title.trim()} onClick={() => void save()}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button disabled={busy} onClick={() => void remove()}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

export function NotesPage() {
  useTitle("Notes");
  const requestedId = useQueryParam("note");
  const { data, error, loading, reload } = useQuery<{ notes: Note[] }>("notes.list", () => client.notes.list());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    return subscribeChannel(
      { kind: "notes" },
      (payload) => {
        if ((payload as { type?: string }).type === "changed") reload();
      },
      () => {},
    );
  }, [reload]);

  const notes = useMemo(() => data?.notes ?? [], [data]);
  const active = notes.find((note) => note.id === requestedId) ?? notes[0] ?? null;

  useEffect(() => {
    if (loading) return;
    if ((active?.id ?? null) !== requestedId) navigate(noteRoute(active?.id ?? null), { replace: true });
  }, [active?.id, requestedId, loading]);

  const createNote = async () => {
    setCreating(true);
    try {
      const { note } = await client.notes.create({ title: "Untitled" });
      reload();
      navigate(noteRoute(note.id));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={`${page} ${s.notesPage}`}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`${page} ${s.notesPage}`}>
      <div className={s.layout}>
        <aside className={s.sidebar}>
          <div className={s.sidebarHead}>
            <h1>Notes</h1>
            <Button accent disabled={creating} onClick={() => void createNote()}>
              New
            </Button>
          </div>
          {error ? <ErrorBox>{error}</ErrorBox> : null}
          {notes.length === 0 ? (
            <Empty>No notes yet — create one.</Empty>
          ) : (
            <ul className={s.list}>
              {notes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    className={note.id === active?.id ? `${s.listItem} ${s.listItemActive}` : s.listItem}
                    onClick={() => navigate(noteRoute(note.id))}
                  >
                    <span className={s.listTitle}>{note.title}</span>
                    <span className={s.listTime}>{new Date(note.updatedAt).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <main className={s.main}>
          {active ? (
            <NoteEditor note={active} onSaved={reload} onDeleted={() => reload()} />
          ) : (
            <Empty>Select or create a note.</Empty>
          )}
        </main>
      </div>
    </div>
  );
}
