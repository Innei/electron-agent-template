import { useId, type ReactNode } from "react";
import * as s from "./SegmentedControl.css";

export interface SegmentedControlOption<Value extends string> {
  label: ReactNode;
  value: Value;
}

interface SegmentedControlProps<Value extends string> {
  ariaLabel: string;
  className?: string;
  onChange: (value: Value) => void;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
}

export function SegmentedControl<Value extends string>({
  ariaLabel,
  className,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  const name = useId();
  const classes = [s.root, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <label className={s.option} key={option.value}>
          <input
            checked={value === option.value}
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
