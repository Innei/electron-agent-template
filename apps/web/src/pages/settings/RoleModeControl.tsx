import { SegmentedControl, type SegmentedControlOption } from "../../ui";
import { ROLE_LABEL, type Role, type RoleMode } from "./types";

const MODE_OPTIONS = [
  { value: "inherit", label: "Follow primary model" },
  { value: "custom", label: "Custom" },
  { value: "disabled", label: "Disabled" },
] satisfies readonly SegmentedControlOption<RoleMode>[];

export function RoleModeControl({
  role,
  value,
  onChange,
}: {
  role: Role;
  value: RoleMode;
  onChange: (mode: RoleMode) => void;
}) {
  return (
    <SegmentedControl
      ariaLabel={ROLE_LABEL[role] + " assignment mode"}
      className="settings-role-mode"
      value={value}
      options={MODE_OPTIONS}
      onChange={onChange}
    />
  );
}
