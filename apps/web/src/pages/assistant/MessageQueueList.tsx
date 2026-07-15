import { X } from "lucide-react";
import type { QueueItem } from "./messageQueue.js";

export function MessageQueueList({ queue, onRemove }: { queue: QueueItem[]; onRemove: (id: string) => void }) {
  if (queue.length === 0) return null;

  return (
    <div className="assistant-queue" aria-label="Pending messages">
      <div className="assistant-queue-head">
        <span>Pending</span>
        <span className="assistant-queue-count">{queue.length}</span>
      </div>
      <div className="assistant-queue-items">
        {queue.map((item) => (
          <div key={item.id} className="assistant-queue-row">
            <span className="assistant-queue-text">{item.text}</span>
            {item.error ? <span className="assistant-queue-error">{item.error}</span> : null}
            <button type="button" className="assistant-queue-remove" aria-label="Remove from queue" onClick={() => onRemove(item.id)}>
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
