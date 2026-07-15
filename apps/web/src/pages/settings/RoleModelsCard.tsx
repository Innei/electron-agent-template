import { Card, SectionTitle } from "../../ui";
import { PrimaryRow } from "./PrimaryRow";
import { RoleRow } from "./RoleRow";
import type { SettingsViewModel } from "./settingsViewModel";
import {
  ROLES,
  type AiRoles,
  type Catalog,
  type CredentialEntry,
  type Role,
  type RoleSetting,
} from "./types";
import * as s from "./settings.css";

export function RoleModelsCard({
  initialRoles,
  roles,
  catalog,
  credentials,
  view,
  onDraftChange,
}: {
  initialRoles: AiRoles;
  roles: AiRoles;
  catalog: Catalog;
  credentials: CredentialEntry[];
  view: SettingsViewModel;
  onDraftChange: (role: Role | "primary", next: RoleSetting) => void;
}) {
  return (
    <Card className={s.cardFlush}>
      <div className={s.cardHeading}>
        <SectionTitle>Model Assignment</SectionTitle>
        <span>Changes save and apply immediately; an analysis already in progress keeps the old configuration</span>
      </div>
      <PrimaryRow
        initial={initialRoles.primary}
        draft={roles.primary}
        catalog={catalog}
        credentials={credentials}
        onDraftChange={(next) => onDraftChange("primary", next)}
      />
      <div className={s.roleList}>
        {ROLES.map((role) => (
          <RoleRow
            key={role}
            role={role}
            initial={initialRoles[role]}
            draft={roles[role]}
            catalog={catalog}
            credentials={credentials}
            view={view.roles[role]}
            onDraftChange={(next) => onDraftChange(role, next)}
          />
        ))}
      </div>
    </Card>
  );
}
