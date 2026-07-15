import { useCallback, useEffect, useState } from "react";
import { navigate } from "../../router";
import { Button } from "../../ui";
import { getDesktopLogsBridge } from "../logViewer/desktopLogs";

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
    <section className="settings-conn-section">
      <div className="settings-conn-title">
        <span>Diagnostics / Logs</span>
      </div>

      {path ? (
        <div className="settings-provider-meta" title={path}>
          {path}
        </div>
      ) : (
        <div className="note-block">Loading…</div>
      )}

      <div className="settings-cred-actions">
        <Button type="button" disabled={busy} onClick={() => navigate("/logs")}>
          View logs
        </Button>
        <Button type="button" disabled={busy} onClick={() => void reveal()}>
          Reveal in Finder
        </Button>
      </div>

      {error ? <div className="settings-test-result settings-test-result--fail">{error}</div> : null}
    </section>
  );
}
