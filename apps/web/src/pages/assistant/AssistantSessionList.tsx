import { Plus, X } from "lucide-react";
import type { AssistantSessionMeta } from "../../../../../packages/core/src/contract";
import { Button, Empty, Spinner, TimeAgo, openModal } from "../../ui";
import * as s from "./assistant.css";

interface AssistantSessionListProps {
  sessions: AssistantSessionMeta[];
  activeId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function confirmDelete(session: AssistantSessionMeta, onDelete: (id: string) => void): void {
  openModal({
    title: "Delete Session",
    body: (close) => (
      <div className={s.confirm}>
        <p>Deleting “{session.title}” cannot be undone. Continue?</p>
        <div className={s.confirmActions}>
          <Button onClick={close}>Cancel</Button>
          <Button
            accent
            onClick={() => {
              onDelete(session.id);
              close();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ),
  });
}

export function AssistantSessionList({ sessions, activeId, loading, error, onSelect, onCreate, onDelete }: AssistantSessionListProps) {
  return (
    <div className={s.sidebar}>
      <div className={s.sidebarHead}>
        <Button className={s.newSession} onClick={onCreate}>
          <Plus size={13} /> New session
        </Button>
      </div>
      <div className={s.sidebarScroll}>
        {loading && sessions.length === 0 ? (
          <div className={s.sidebarState}>
            <Spinner /> Loading sessions…
          </div>
        ) : error ? (
          <div className={s.sidebarState}>{error}</div>
        ) : sessions.length === 0 ? (
          <Empty className={s.sidebarEmpty}>No sessions yet</Empty>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={session.id === activeId ? `${s.sessionRow} ${s.sessionRowActive}` : s.sessionRow}
              onClick={() => onSelect(session.id)}
            >
              <div className={s.sessionRowMain}>
                <span className={s.sessionTitle}>{session.title}</span>
                <span className={s.sessionTime}>
                  <TimeAgo since={session.updatedAt} />
                </span>
              </div>
              <button
                type="button"
                className={s.sessionDelete}
                aria-label="Delete session"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(session, onDelete);
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
