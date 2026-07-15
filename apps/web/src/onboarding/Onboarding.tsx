import { trafficSpacer } from "../desktop/DesktopTitlebar.css";
import { StepAi } from "./StepAi";
import * as s from "./Onboarding.css";

export function Onboarding({ onComplete }: { onComplete: () => Promise<void> }) {
  return (
    <>
      <div className={s.dragBar} aria-hidden="true">
        <div className={trafficSpacer} />
      </div>
      <div className={`page ${s.page}`}>
        <div className={s.shell}>
          <StepAi onNext={() => void onComplete()} />
        </div>
      </div>
    </>
  );
}
