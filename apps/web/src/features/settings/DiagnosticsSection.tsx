import { useCallback, useEffect, useState } from "react";
import { noteBlock } from "../../styles/layout.css";
import { navigate } from "../../lib/router";
import { Button } from "../../ui";
import { getDesktopLogsBridge } from "../logs/desktopLogs";
import * as s from "./settings.css";

export function DiagnosticsSection() {
  const bridge = getDesktopLogsBridge();
  const [path, setPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!bridge) return;
    try {
      const info = await bridge.getInfo();
      setPath(info.path);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [bridge]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!bridge) return null;

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      await bridge.reveal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={s.connSection}>
      <div className={s.connTitle}>
        <span>Diagnostics / Logs</span>
      </div>

      {path ? (
        <div className={s.providerMeta} title={path}>
          {path}
        </div>
      ) : (
        <div className={noteBlock}>Loading…</div>
      )}

      <div className={s.credActions}>
        <Button type="button" disabled={busy} onClick={() => navigate("/logs")}>
          View logs
        </Button>
        <Button type="button" disabled={busy} onClick={() => void reveal()}>
          Reveal in Finder
        </Button>
      </div>

      {error ? <div className={`${s.testResult} ${s.testResultFail}`}>{error}</div> : null}
    </section>
  );
}
