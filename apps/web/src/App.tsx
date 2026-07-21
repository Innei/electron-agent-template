import { AppSkeleton } from "./AppSkeleton";
import { DesktopShell } from "./features/desktop/DesktopShell";
import { Onboarding } from "./features/onboarding/Onboarding";
import { useOnboardingGate } from "./features/onboarding/useOnboardingGate";
import { Router } from "./PageRouter";
import { isDesktopRealtime } from "./lib/portTransport";
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
