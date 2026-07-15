import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import * as s from "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  options,
  onChange,
  className,
  disabled = false,
  ariaLabel,
  placeholder,
  onOpenChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <BaseSelect.Root
      items={options}
      value={value || null}
      disabled={disabled}
      onValueChange={(v) => onChange(v as string)}
      onOpenChange={(open) => onOpenChange?.(open)}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={[s.trigger, className].filter(Boolean).join(" ")}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon className={s.icon}>
          <ChevronDown size={12} aria-hidden="true" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className={s.positioner} sideOffset={4}>
          <BaseSelect.Popup className={s.popup}>
            <BaseSelect.List>
              {options.map((o) => (
                <BaseSelect.Item key={o.value} value={o.value} className={s.item}>
                  <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className={s.itemCheck}>
                    <Check size={11} aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
