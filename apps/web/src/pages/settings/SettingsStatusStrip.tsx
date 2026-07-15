import { root as numStyle } from "../../ui/Num.css";
import type { SettingsViewModel } from "./settingsViewModel";

type Summary = SettingsViewModel["summary"];

export function SettingsStatusStrip({
  summary,
  usageError,
  onRetryUsage,
}: {
  summary: Summary;
  usageError: string | null;
  onRetryUsage: () => void;
}) {
  return (
    <div className="settings-statusline" aria-label="Settings status overview">
      <span className={"settings-statusline-state settings-statusline-state--" + summary.statusTone}>
        {summary.statusLabel}
      </span>
      <span className="settings-statusline-sep">·</span>
      <span>{summary.enabledLabel}</span>
      <span className={`settings-statusline-usage ${numStyle}`}>
        {usageError ? (
          <>
            Failed to load today's usage
            <button className="settings-statusline-retry" type="button" onClick={onRetryUsage}>
              Retry
            </button>
          </>
        ) : summary.usageLabel === "Unavailable" ? (
          "Today's usage unavailable"
        ) : (
          "Today " + summary.usageLabel
        )}
      </span>
    </div>
  );
}
