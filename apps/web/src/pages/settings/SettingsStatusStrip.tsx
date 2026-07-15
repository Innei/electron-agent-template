import { root as numStyle } from "../../ui/Num.css";
import type { SettingsViewModel } from "./settingsViewModel";
import * as s from "./settings.css";

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
    <div className={s.statusline} aria-label="Settings status overview">
      <span className={`${s.statuslineState} ${s.statuslineStateTone[summary.statusTone]}`}>
        {summary.statusLabel}
      </span>
      <span className={s.statuslineSep}>·</span>
      <span>{summary.enabledLabel}</span>
      <span className={`${s.statuslineUsage} ${numStyle}`}>
        {usageError ? (
          <>
            Failed to load today's usage
            <button className={s.statuslineRetry} type="button" onClick={onRetryUsage}>
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
