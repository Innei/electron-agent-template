import { Plus, X } from "lucide-react";
import type { AssistantSessionMeta } from "../../../../../packages/core/src/contract";
import { Button, Empty, Spinner, TimeAgo, openModal } from "../../ui";

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
      <div className="assistant-confirm">
        <p>Deleting “{session.title}” cannot be undone. Continue?</p>
        <div className="assistant-confirm-actions">
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
    <div className="assistant-sidebar">
      <div className="assistant-sidebar-head">
        <Button className="assistant-new-session" onClick={onCreate}>
          <Plus size={13} /> New session
        </Button>
      </div>
      <div className="assistant-sidebar-scroll">
        {loading && sessions.length === 0 ? (
          <div className="assistant-sidebar-state">
            <Spinner /> Loading sessions…
          </div>
        ) : error ? (
          <div className="assistant-sidebar-state">{error}</div>
        ) : sessions.length === 0 ? (
          <Empty className="assistant-sidebar-empty">No sessions yet</Empty>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`assistant-session-row${session.id === activeId ? " active" : ""}`}
              onClick={() => onSelect(session.id)}
            >
              <div className="assistant-session-row-main">
                <span className="assistant-session-title">{session.title}</span>
                <span className="assistant-session-time">
                  <TimeAgo since={session.updatedAt} />
                </span>
              </div>
              <button
                type="button"
                className="assistant-session-delete"
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
