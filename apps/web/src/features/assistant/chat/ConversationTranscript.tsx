import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "../../../ui";
import { Markdown } from "../../../lib/markdown";
import { mergeTimeline, type TranscriptInsert } from "./transcriptTimeline.js";
import { summarizeToolInput, toolRowKey } from "./toolSummary.js";
import type { ChatLiveTool, ChatRow } from "./useChatSession";
import * as s from "./chat.css";

const SCROLL_STICK_THRESHOLD = 48;
const tokenFormatter = new Intl.NumberFormat("en-US");
const costFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

function ToolRow({ label, running, input, output }: { label: string; running: boolean; input?: string; output?: string }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(input || output);
  const summary = summarizeToolInput(input);

  return (
    <div className={s.tool}>
      <button
        type="button"
        className={s.toolHead}
        onClick={() => setOpen((current) => !current)}
        disabled={!hasDetail}
        aria-expanded={open}
      >
        <span className={running ? `${s.toolDot} ${s.toolDotRunning}` : s.toolDot} />
        <span>
          {running ? "Running " : "Called "}
          {label}
          {running ? "…" : ""}
        </span>
        {summary ? <span className={s.toolSummary}>{summary}</span> : null}
        {hasDetail ? <ChevronRight size={12} className={open ? `${s.toolCaret} ${s.toolCaretOpen}` : s.toolCaret} /> : null}
      </button>
      {open && hasDetail ? (
        <div className={s.toolDetail}>
          {input ? (
            <div>
              <div className={s.toolDetailLabel}>Input</div>
              <pre>{input}</pre>
            </div>
          ) : null}
          {output ? (
            <div>
              <div className={s.toolDetailLabel}>Output</div>
              <pre>{output}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChatRowView({ row, modelLabels }: { row: ChatRow; modelLabels?: Readonly<Record<string, string>> }) {
  if (row.kind === "user") {
    return (
      <div className={`${s.row} ${s.rowUser}`}>
        <div className={`${s.bubble} ${s.bubbleUser}`}>{row.text}</div>
      </div>
    );
  }
  if (row.kind === "assistant") {
    const meta = row.meta;
    const modelLabel = meta
      ? (modelLabels?.[JSON.stringify([meta.provider, meta.model])] ?? `${meta.provider}/${meta.model}`)
      : null;
    return (
      <div className={s.row}>
        <div className={s.assistantMessage}>
          <div className={`${s.bubble} ${s.bubbleAssistant}`}>
            <Markdown variant="chat">{row.text ?? ""}</Markdown>
          </div>
          {meta && modelLabels ? (
            <div className={s.messageMeta}>
              <span>{modelLabel}</span>
              <span>{tokenFormatter.format(meta.totalTokens)} tokens</span>
              <span>{costFormatter.format(meta.costTotal)}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  if (row.kind === "tool") {
    return <ToolRow label={row.label ?? ""} running={false} input={row.input} output={row.output} />;
  }
  return <div className={s.errorRow}>{row.text}</div>;
}

function ConversationTranscriptView({
  rows,
  inserts = [],
  busy,
  streamText,
  liveTools,
  suggestions,
  emptyText,
  onPickSuggestion,
  className,
  modelLabels,
}: {
  rows: ChatRow[];
  inserts?: TranscriptInsert[];
  busy: boolean;
  streamText: string;
  liveTools: ChatLiveTool[];
  suggestions: string[];
  emptyText: string;
  onPickSuggestion: (question: string) => void;
  className?: string;
  modelLabels?: Readonly<Record<string, string>>;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const element = bodyRef.current;
    if (!element || !stickRef.current) return;
    element.scrollTop = element.scrollHeight;
  }, [rows, inserts, streamText, liveTools]);

  const timeline = useMemo(() => mergeTimeline(rows, inserts), [rows, inserts]);

  const isEmpty = rows.length === 0 && inserts.length === 0 && liveTools.length === 0 && !streamText;

  return (
    <ScrollArea
      className={className}
      contentClassName={s.panelBodyContent}
      viewportRef={bodyRef}
      onScroll={() => {
        const element = bodyRef.current;
        if (!element) return;
        stickRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < SCROLL_STICK_THRESHOLD;
      }}
    >
      {isEmpty && !busy ? (
        <div className={s.empty}>
          <div className={s.emptyText}>{emptyText}</div>
          {suggestions.length > 0 ? (
            <div className={s.suggestions}>
              {suggestions.map((question) => (
                <button type="button" key={question} className={s.suggestion} onClick={() => onPickSuggestion(question)}>
                  {question}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {timeline.map((entry) =>
        entry.kind === "row" ? (
          <ChatRowView key={entry.row.id} row={entry.row} modelLabels={modelLabels} />
        ) : (
          <div key={entry.insert.id} className={s.insert}>
            {entry.insert.node}
          </div>
        ),
      )}
      {liveTools.map((tool) => (
        <ToolRow
          key={toolRowKey("live", tool.id)}
          label={tool.label}
          running={tool.status === "start"}
          input={tool.input}
          output={tool.output}
        />
      ))}
      {streamText ? (
        <div className={s.row}>
          <div className={`${s.bubble} ${s.bubbleAssistant}`}>
            <Markdown variant="chat">{streamText}</Markdown>
            <span className={s.cursor} />
          </div>
        </div>
      ) : null}
    </ScrollArea>
  );
}

export const ConversationTranscript = memo(ConversationTranscriptView);
