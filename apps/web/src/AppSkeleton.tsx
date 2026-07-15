function isElectronShell(): boolean {
  return typeof navigator !== "undefined" && /\bElectron\b/.test(navigator.userAgent);
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`app-skeleton-bone${className ? ` ${className}` : ""}`} />;
}

export function AppSkeleton() {
  const desktop = isElectronShell();

  return (
    <div
      className={`app-skeleton${desktop ? " app-skeleton--desktop" : ""}`}
      aria-busy="true"
      aria-label="Loading"
    >
      {desktop && (
        <div className="app-skeleton-titlebar">
          <div className="app-skeleton-traffic" />
          <div className="app-skeleton-tabstrip">
            <Bone className="app-skeleton-bone--tab" />
          </div>
        </div>
      )}

      <div className="page notes-page">
        <div className="notes-layout" aria-hidden="true">
          <aside className="notes-sidebar">
            <Bone className="app-skeleton-bone--input" />
            <Bone className="app-skeleton-bone--row" />
            <Bone className="app-skeleton-bone--row" />
            <Bone className="app-skeleton-bone--row" />
          </aside>
          <main className="notes-main">
            <Bone className="app-skeleton-bone--chart-title" />
            <Bone className="app-skeleton-bone--chart" />
          </main>
        </div>
      </div>
    </div>
  );
}
