import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as s from "./Switch.css";

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <BaseSwitch.Root
      aria-label={ariaLabel}
      checked={checked}
      disabled={disabled}
      className={s.root}
      onCheckedChange={onCheckedChange}
    >
      <BaseSwitch.Thumb className={s.thumb} />
    </BaseSwitch.Root>
  );
}
