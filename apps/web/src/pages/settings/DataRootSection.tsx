import { useCallback, useEffect, useState } from "react";
import { noteBlock } from "../../styles/layout.css";
import { Badge, Button } from "../../ui";
import {
  getDesktopDataRootBridge,
  isDataRootResetDisabled,
  type DataRootBridgeStatus,
} from "./desktopDataRoot";
import * as s from "./settings.css";

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
    <section className={s.connSection}>
      <div className={s.connTitle}>
        <span>Data directory</span>
        {mode ? (
          <Badge tone={status?.degraded ? "down" : mode === "custom" ? "accent" : undefined}>
            {MODE_LABEL[mode]}
          </Badge>
        ) : null}
      </div>

      {status?.effectivePath ? (
        <div className={s.providerMeta}>{status.effectivePath}</div>
      ) : (
        <div className={noteBlock}>Loading…</div>
      )}

      {status?.degraded ? <div className={s.warningStrip}>{DEGRADED_MESSAGE}</div> : null}

      {status?.restartPending ? (
        <div className={`${s.testResult} ${s.testResultOk}`}>Setting saved; takes effect after restarting the app</div>
      ) : null}

      {mode === "env" ? (
        <div className={noteBlock}>Currently overridden by the TRADE_PROJECT_ROOT environment variable; cannot be changed here.</div>
      ) : null}

      {mode === "dev-repo" ? (
        <div className={noteBlock}>Development mode uses the repository directory; choosing will note that no setup is needed.</div>
      ) : null}

      <div className={noteBlock}>
        Pick an empty directory (or one that already holds this app's data/); restart after changing.
      </div>

      {error ? <div className={`${s.testResult} ${s.testResultFail}`}>{error}</div> : null}

      <div className={s.credActions}>
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
