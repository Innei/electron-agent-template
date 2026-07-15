import type { MentionCandidate } from "./atMention.js";
import * as s from "./assistant.css";

export function AtMentionPopover({
  candidates,
  activeIndex,
  onPick,
}: {
  candidates: MentionCandidate[];
  activeIndex: number;
  onPick: (candidate: MentionCandidate) => void;
}) {
  if (candidates.length === 0) {
    return (
      <div className={s.mentionPopover}>
        <div className={s.mentionEmpty}>No matching files</div>
      </div>
    );
  }

  return (
    <div className={s.mentionPopover} role="listbox" aria-label="Research files">
      {candidates.map((candidate, index) => (
        <button
          type="button"
          key={candidate.path}
          role="option"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? `${s.mentionItem} ${s.mentionItemActive}` : s.mentionItem}
          onMouseDown={(event) => {
            event.preventDefault();
            onPick(candidate);
          }}
        >
          <span className={s.mentionTitle}>{candidate.title}</span>
          <span className={s.mentionPath}>{candidate.path}</span>
        </button>
      ))}
    </div>
  );
}
