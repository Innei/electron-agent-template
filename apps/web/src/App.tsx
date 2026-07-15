import { AppSkeleton } from "./AppSkeleton";
import { DesktopShell } from "./desktop/DesktopShell";
import { Onboarding } from "./onboarding/Onboarding";
import { useOnboardingGate } from "./onboarding/useOnboardingGate";
import { Router } from "./PageRouter";
import { isDesktopRealtime } from "./portTransport";
import { ContextMenuHost, ModalHost } from "./ui";

export function App() {
  const gate = useOnboardingGate();

  if (gate.status === "loading") {
    return <AppSkeleton />;
  }

  if (gate.status === "onboarding") {
    return <Onboarding onComplete={gate.completeOnboarding} />;
  }

  if (isDesktopRealtime()) {
    return <DesktopShell />;
  }

  return (
    <>
      <Router />
      <ModalHost />
      <ContextMenuHost />
    </>
  );
}
