import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, FolderOpen, RefreshCw } from "lucide-react";
import { navigate } from "../../lib/router";
import { useTitle } from "../../lib/useTitle";
import { icon, noteBlock, page } from "../../styles/layout.css";
import { Button, ErrorBox } from "../../ui";
import { backLink } from "../settings/settings.css";
import * as s from "./logs.css";
import { getDesktopLogsBridge } from "./desktopLogs";

const POLL_MS = 2000;
const TAIL_BYTES = 256 * 1024;

export function LogsPage() {
  useTitle("Logs");
  const bridge = getDesktopLogsBridge();
  const [path, setPath] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const preRef = useRef<HTMLPreElement | null>(null);
  const stickToBottom = useRef(true);

  const reload = useCallback(async () => {
    if (!bridge) return;
    try {
      const [info, tail] = await Promise.all([bridge.getInfo(), bridge.tail({ maxBytes: TAIL_BYTES })]);
      setPath(info.path);
      setText(tail.text);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [bridge]);

  useEffect(() => {
    if (!bridge) return;
    void reload();
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [bridge, reload]);

  useEffect(() => {
    if (!autoScroll || !stickToBottom.current) return;
    const el = preRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [text, autoScroll]);

  const onScroll = () => {
    const el = preRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    stickToBottom.current = nearBottom;
    setAutoScroll(nearBottom);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const reveal = async () => {
    if (!bridge) return;
    try {
      await bridge.reveal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!bridge) {
    return (
      <div className={`${page} ${s.logsPage}`}>
        <LogsBackLink />
        <h1>Logs</h1>
        <div className={noteBlock}>Log viewing is only available in the desktop app.</div>
      </div>
    );
  }

  return (
    <div className={`${page} ${s.logsPage}`}>
      <LogsBackLink />
      <div className={s.header}>
        <div>
          <h1>Logs</h1>
          <div className={s.path} title={path ?? undefined}>
            {path ?? "Loading…"}
          </div>
        </div>
        <div className={s.actions}>
          <Button type="button" onClick={() => void reload()}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button type="button" onClick={() => void copyAll()}>
            <Copy size={14} /> {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" onClick={() => void reveal()}>
            <FolderOpen size={14} /> Reveal in Finder
          </Button>
        </div>
      </div>

      {error ? <ErrorBox className={s.error}>{error}</ErrorBox> : null}

      <div className={s.meta}>
        Showing last ~{Math.round(TAIL_BYTES / 1024)} KB · auto-refreshes every {POLL_MS / 1000}s
        {autoScroll ? " · following latest" : " · paused (scroll to bottom to resume)"}
      </div>

      <pre ref={preRef} className={s.viewer} onScroll={onScroll}>
        {text || "(no logs yet)"}
      </pre>
    </div>
  );
}

function LogsBackLink() {
  return (
    <a
      className={backLink}
      href="/"
      onClick={(event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (window.history.length > 1) window.history.back();
        else navigate("/");
      }}
    >
      <ArrowLeft className={icon} size={13} /> Back
    </a>
  );
}
