import { X } from "lucide-react";
import type { QueueItem } from "./messageQueue.js";
import * as s from "./assistant.css";

export function MessageQueueList({ queue, onRemove }: { queue: QueueItem[]; onRemove: (id: string) => void }) {
  if (queue.length === 0) return null;

  return (
    <div className={s.queue} aria-label="Pending messages">
      <div className={s.queueHead}>
        <span>Pending</span>
        <span className={s.queueCount}>{queue.length}</span>
      </div>
      <div className={s.queueItems}>
        {queue.map((item) => (
          <div key={item.id} className={s.queueRow}>
            <span className={s.queueText}>{item.text}</span>
            {item.error ? <span className={s.queueError}>{item.error}</span> : null}
            <button type="button" className={s.queueRemove} aria-label="Remove from queue" onClick={() => onRemove(item.id)}>
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
