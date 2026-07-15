import * as s from "./AppSkeleton.css";
import { page } from "./styles/layout.css";
import * as notes from "./pages/notes/notes.css";

function isElectronShell(): boolean {
  return typeof navigator !== "undefined" && /\bElectron\b/.test(navigator.userAgent);
}

function Bone({ variant }: { variant: keyof typeof s.boneVariant }) {
  return <div className={[s.bone, s.boneVariant[variant]].join(" ")} />;
}

export function AppSkeleton() {
  const desktop = isElectronShell();

  return (
    <div
      className={[s.root, desktop ? s.desktop : null].filter(Boolean).join(" ")}
      aria-busy="true"
      aria-label="Loading"
    >
      {desktop && (
        <div className={s.titlebar}>
          <div className={s.traffic} />
          <div className={s.tabstrip}>
            <Bone variant="tab" />
          </div>
        </div>
      )}

      <div className={`${page} ${notes.notesPage}`}>
        <div className={notes.layout} aria-hidden="true">
          <aside className={notes.sidebar}>
            <Bone variant="input" />
            <Bone variant="row" />
            <Bone variant="row" />
            <Bone variant="row" />
          </aside>
          <main className={notes.main}>
            <Bone variant="chartTitle" />
            <Bone variant="chart" />
          </main>
        </div>
      </div>
    </div>
  );
}
