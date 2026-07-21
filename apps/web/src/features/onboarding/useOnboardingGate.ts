import { useCallback } from "react";
import { useQuery } from "../../lib/apiHooks";
import { getDesktopOnboardingBridge, type OnboardingState } from "./desktopOnboarding";

export type GateStatus = "loading" | "onboarding" | "ready";

export function useOnboardingGate(): {
  status: GateStatus;
  completeOnboarding: () => Promise<void>;
} {
  const bridge = getDesktopOnboardingBridge();

  const { data, loading, reload } = useQuery<OnboardingState>(
    bridge ? "onboarding.state" : null,
    () => bridge!.getState(),
  );

  const completeOnboarding = useCallback(async () => {
    if (bridge) await bridge.complete();
    reload();
  }, [bridge, reload]);

  // No desktop bridge (plain browser) or a failed probe fails open to ready —
  // onboarding must never trap someone out of the app.
  const status: GateStatus = !bridge ? "ready" : loading ? "loading" : data && data.completed === false ? "onboarding" : "ready";

  return { status, completeOnboarding };
}
