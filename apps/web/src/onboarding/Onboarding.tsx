import { StepAi } from "./StepAi";

export function Onboarding({ onComplete }: { onComplete: () => Promise<void> }) {
  return (
    <>
      <div className="onboarding-drag-bar" aria-hidden="true">
        <div className="desktop-titlebar-traffic-spacer" />
      </div>
      <div className="page onboarding-page">
        <div className="onboarding-shell">
          <StepAi onNext={() => void onComplete()} />
        </div>
      </div>
    </>
  );
}
