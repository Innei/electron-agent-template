import { useCallback, useEffect, useState } from "react";
import { Badge, Button } from "../../ui";
import {
  getDesktopDataRootBridge,
  isDataRootResetDisabled,
  type DataRootBridgeStatus,
} from "./desktopDataRoot";

const MODE_LABEL: Record<DataRootBridgeStatus["mode"], string> = {
  default: "System default",
  custom: "Custom",
  env: "Environment variable",
  "dev-repo": "Dev repository",
};

const DEGRADED_MESSAGE =
  "The custom data directory is unavailable; temporarily using the system default. Pick a new directory or restore the default.";

export function DataRootSection() {
  const bridge = getDesktopDataRootBridge();
  const [status, setStatus] = useState<DataRootBridgeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!bridge) return;
    try {
      const next = await bridge.get();
      setStatus(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [bridge]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!bridge) return null;

  const mode = status?.mode;
  const envLocked = mode === "env";
  const pickDisabled = busy || envLocked;
  const resetDisabled = isDataRootResetDisabled(status, busy);

  const run = async (action: "pick" | "reset") => {
    setBusy(true);
    setError(null);
    try {
      if (action === "pick") await bridge.pick();
      else await bridge.reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-conn-section">
      <div className="settings-conn-title">
        <span>Data directory</span>
        {mode ? (
          <Badge tone={status?.degraded ? "down" : mode === "custom" ? "accent" : undefined}>
            {MODE_LABEL[mode]}
          </Badge>
        ) : null}
      </div>

      {status?.effectivePath ? (
        <div className="settings-provider-meta">{status.effectivePath}</div>
      ) : (
        <div className="note-block">Loading…</div>
      )}

      {status?.degraded ? <div className="settings-warning-strip">{DEGRADED_MESSAGE}</div> : null}

      {status?.restartPending ? (
        <div className="settings-test-result settings-test-result--ok">Setting saved; takes effect after restarting the app</div>
      ) : null}

      {mode === "env" ? (
        <div className="note-block">Currently overridden by the TRADE_PROJECT_ROOT environment variable; cannot be changed here.</div>
      ) : null}

      {mode === "dev-repo" ? (
        <div className="note-block">Development mode uses the repository directory; choosing will note that no setup is needed.</div>
      ) : null}

      <div className="note-block">
        Pick an empty directory (or one that already holds this app's data/); restart after changing.
      </div>

      {error ? <div className="settings-test-result settings-test-result--fail">{error}</div> : null}

      <div className="settings-cred-actions">
        <Button disabled={pickDisabled} onClick={() => void run("pick")}>
          Choose…
        </Button>
        <Button disabled={resetDisabled} onClick={() => void run("reset")}>
          Restore default
        </Button>
      </div>
    </section>
  );
}
