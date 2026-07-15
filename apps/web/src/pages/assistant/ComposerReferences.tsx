import { AtSign, X } from "lucide-react";
import type { MentionCandidate } from "./atMention.js";
import * as s from "./conversation.css";

export function ComposerReferences({
  references,
  onRemove,
}: {
  references: MentionCandidate[];
  onRemove: (path: string) => void;
}) {
  if (references.length === 0) return null;

  return (
    <div className={s.composerReferences} aria-label="Referenced research files">
      {references.map((reference) => (
        <span className={s.composerReference} key={reference.path}>
          <AtSign size={12} aria-hidden="true" />
          <span className={s.composerReferenceTitle}>{reference.title}</span>
          <span className={s.composerReferencePath}>{reference.path}</span>
          <button type="button" aria-label={`Remove ${reference.title}`} onClick={() => onRemove(reference.path)}>
            <X size={11} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
