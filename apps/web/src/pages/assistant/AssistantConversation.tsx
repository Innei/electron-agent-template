import { gsap } from "gsap";
import { AtSign } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { Kbd, Select } from "../../ui";
import { ChatComposer } from "./chat/ChatComposer";
import { ConversationTranscript } from "./chat/ConversationTranscript";
import { useAssistantChatSession } from "./chat/useChatSession";
import type { MentionCandidate, MentionTrigger } from "./atMention.js";
import type { AssistantModelChoice } from "./assistantModels";
import {
  detectMentionTrigger,
  filterMentionCandidates,
  findMentionedCandidates,
  insertMention,
  removeMention,
} from "./atMention.js";
import { AtMentionPopover } from "./AtMentionPopover";
import { shouldExpandComposer } from "./composerExpansion";
import { ComposerReferences } from "./ComposerReferences";
import { MessageQueueList } from "./MessageQueueList";
import { decideSubmitAction } from "./messageQueue.js";
import { useMessageQueue } from "./useMessageQueue.js";
import * as shell from "./assistant.css";
import * as s from "./conversation.css";

interface MentionState {
  trigger: MentionTrigger;
  activeIndex: number;
}

export function AssistantConversation({
  sessionId,
  refreshSessions,
  mentionCandidates,
  modelChoices,
  selectedModelValue,
  modelSaving,
  modelError,
  modelLabels,
  onModelChange,
}: {
  sessionId: string;
  refreshSessions: () => void;
  mentionCandidates: MentionCandidate[];
  modelChoices: AssistantModelChoice[];
  selectedModelValue: string;
  modelSaving: boolean;
  modelError: string | null;
  modelLabels: Readonly<Record<string, string>>;
  onModelChange: (value: string) => void;
}) {
  const { session, rows, busy, aborting, streamText, liveTools, hint, send, abort } = useAssistantChatSession(sessionId);
  const [text, setText] = useState("");
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const wasBusyRef = useRef(busy);
  const cursorRef = useRef(text.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const composerTargetHeightRef = useRef<number | null>(null);

  useEffect(() => {
    if (wasBusyRef.current && !busy) refreshSessions();
    wasBusyRef.current = busy;
  }, [busy, refreshSessions]);

  const doSend = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, error: "Message cannot be empty" };
    return send(trimmed);
  };

  const queue = useMessageQueue({ busy, onSend: doSend });

  const filteredMentions = mentionState ? filterMentionCandidates(mentionCandidates, mentionState.trigger.query) : [];
  const mentionedCandidates = useMemo(
    () => findMentionedCandidates(text, mentionCandidates),
    [mentionCandidates, text],
  );
  const composerExpanded = shouldExpandComposer({
    busy,
    focusedWithin: composerFocused,
    hasHint: Boolean(hint),
    hasReferences: mentionedCandidates.length > 0,
    hasText: text.trim().length > 0,
    modelPickerOpen,
    queueLength: queue.queue.length,
  });

  useLayoutEffect(() => {
    const element = composerRef.current;
    if (!element) return;

    const previousTarget = composerTargetHeightRef.current;
    const inlineHeight = element.style.height;
    const renderedHeight = element.getBoundingClientRect().height;
    const fromHeight = inlineHeight && inlineHeight !== "auto" ? renderedHeight : (previousTarget ?? renderedHeight);

    gsap.killTweensOf(element);
    gsap.set(element, { height: "auto" });
    const targetHeight = element.getBoundingClientRect().height;
    composerTargetHeightRef.current = targetHeight;

    if (previousTarget === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(element, { clearProps: "height,overflow" });
      return;
    }

    gsap.fromTo(
      element,
      { height: fromHeight, overflow: "hidden" },
      {
        height: targetHeight,
        duration: 0.24,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => gsap.set(element, { clearProps: "height,overflow" }),
      },
    );
  }, [composerExpanded]);

  useEffect(() => () => {
    if (composerRef.current) gsap.killTweensOf(composerRef.current);
  }, []);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setText("");
    setMentionState(null);
    if (decideSubmitAction(busy, queue.queue.length) === "enqueue") {
      queue.enqueue(trimmed);
      return;
    }
    void doSend(trimmed).then((result) => {
      if (!result.ok) setText(trimmed);
    });
  };

  const syncCursor = (value: string, selectionStart: number | null) => {
    const cursor = selectionStart ?? value.length;
    cursorRef.current = cursor;
    setMentionState((current) => {
      const trigger = detectMentionTrigger(value, cursor);
      if (!trigger) return null;
      if (current && current.trigger.start === trigger.start) return { trigger, activeIndex: current.activeIndex };
      return { trigger, activeIndex: 0 };
    });
  };

  const syncCursorFromEvent = (event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    syncCursor(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  const pickMention = (candidate: MentionCandidate) => {
    if (!mentionState) return;
    const result = insertMention(text, cursorRef.current, mentionState.trigger, candidate.path);
    setText(result.text);
    cursorRef.current = result.cursor;
    setMentionState(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const openMentionPicker = () => {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const needsLeadingSpace = cursor > 0 && !/\s/.test(text[cursor - 1] ?? "");
    const inserted = `${needsLeadingSpace ? " " : ""}@`;
    const next = text.slice(0, cursor) + inserted + text.slice(cursor);
    const nextCursor = cursor + inserted.length;
    setText(next);
    syncCursor(next, nextCursor);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const removeReference = (path: string) => {
    const next = removeMention(text, path);
    setText(next);
    setMentionState(null);
    cursorRef.current = next.length;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(next.length, next.length);
    });
  };

  return (
    <div className={s.conversation}>
      <div className={s.conversationHead}>
        <span className={s.conversationTitle}>{session?.title ?? "New session"}</span>
      </div>
      <ConversationTranscript
        className={s.conversationBody}
        rows={rows}
        busy={busy}
        streamText={streamText}
        liveTools={liveTools}
        suggestions={[]}
        emptyText="Type a question, a take, or a trading plan to start a research conversation"
        onPickSuggestion={() => {}}
        modelLabels={modelLabels}
      />
      <div className={s.conversationDock}>
        <div className={s.conversationDockInner}>
          <MessageQueueList queue={queue.queue} onRemove={queue.remove} />
          <div className={s.composerWrap}>
            {mentionState ? (
              <div className={shell.mentionLayer}>
                <AtMentionPopover candidates={filteredMentions} activeIndex={mentionState.activeIndex} onPick={pickMention} />
              </div>
            ) : null}
            <div
              ref={composerRef}
              className={s.conversationComposer}
              data-expanded={composerExpanded ? "" : undefined}
              onFocusCapture={() => setComposerFocused(true)}
              onBlurCapture={(event) => {
                const nextTarget = event.relatedTarget;
                if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                  setComposerFocused(false);
                }
              }}
            >
              <ComposerReferences references={mentionedCandidates} onRemove={removeReference} />
              <ChatComposer
                value={text}
                onChange={setText}
                busy={busy}
                aborting={aborting}
                allowInputWhileBusy
                disabled={modelSaving}
                multiline
                textareaRef={textareaRef}
                placeholder="Write a question, a take, or an action request; use @ to reference research files…"
                onSubmit={submit}
                onAbort={() => void abort()}
                hint={hint}
                onValueDetail={(value, selectionStart) => syncCursor(value, selectionStart)}
                inputProps={{
                  onKeyUp: syncCursorFromEvent,
                  onClick: syncCursorFromEvent,
                  onSelect: syncCursorFromEvent,
                }}
                onKeyDownIntercept={(event) => {
                  if (!mentionState || filteredMentions.length === 0) return false;
                  if (event.key === "Escape") {
                    setMentionState(null);
                    event.preventDefault();
                    return true;
                  }
                  if (event.key === "ArrowDown") {
                    setMentionState((current) =>
                      current ? { ...current, activeIndex: Math.min(current.activeIndex + 1, filteredMentions.length - 1) } : current,
                    );
                    event.preventDefault();
                    return true;
                  }
                  if (event.key === "ArrowUp") {
                    setMentionState((current) =>
                      current ? { ...current, activeIndex: Math.max(current.activeIndex - 1, 0) } : current,
                    );
                    event.preventDefault();
                    return true;
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    const candidate = filteredMentions[mentionState.activeIndex];
                    if (candidate) pickMention(candidate);
                    return true;
                  }
                  return false;
                }}
              />
              <div className={s.composerMeta} aria-hidden={!composerExpanded} inert={!composerExpanded}>
                <div className={s.composerTools}>
                  <Select
                    value={selectedModelValue}
                    options={modelChoices}
                    onChange={onModelChange}
                    className={s.modelSelect}
                    disabled={modelSaving || modelChoices.length === 0}
                    ariaLabel="Choose conversation model"
                    placeholder={modelChoices.length === 0 ? "No model configured" : "Choose model"}
                    onOpenChange={setModelPickerOpen}
                  />
                  <button
                    type="button"
                    className={s.contextAction}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={openMentionPicker}
                  >
                    <AtSign size={13} aria-hidden="true" /> Add reference
                  </button>
                </div>
                <div className={s.composerStatus}>
                  {modelError ? (
                    <span className={s.modelError} role="alert">
                      {modelError}
                    </span>
                  ) : null}
                  <span className={s.composerShortcut}>
                    <Kbd keys={["enter"]} /> Send · <Kbd keys={["shift", "enter"]} /> New line
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
