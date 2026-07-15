# Desktop release pipeline

Flow: bump `apps/desktop/package.json` version + add a `## <version>` section to
`apps/desktop/CHANGELOG.md` on `main` → `desktop-tag.yml` tags `desktop-vX.Y.Z` and dispatches
`desktop-release.yml` → macOS runner typechecks/tests, builds the web app, packages dmg+zip,
signs the zip with Sparkle EdDSA, regenerates `appcast.xml` (with deltas against the previous
two releases), and publishes everything as a GitHub Release. The app's Sparkle feed points at
`releases/latest/download/appcast.xml`, so publishing is the rollout.

## One-time setup

1. **Sparkle keys**: download Sparkle (same version as `SPARKLE_VERSION` in the workflow), run
   `./bin/generate_keys -f ed_private_key`; store the printed public key and the file contents as
   repo secrets:
   - `SPARKLE_ED_PUBLIC_KEY` — injected into `electron-builder.yml` over
     `SPARKLE_ED_PUBLIC_KEY_PLACEHOLDER` at build time.
   - `SPARKLE_ED_PRIVATE_KEY` — used by `generate_appcast` on a RAM disk, never written to disk.
2. **Repo slug**: `init.mjs` rewrites the `your-org/your-app` placeholder in
   `apps/desktop/src/updater/updater.ts`, `electron-builder.yml` (SUFeedURL) and
   `scripts/release-dry-run.sh`. The workflow itself uses `${{ github.repository }}`.
3. **Code signing (optional)**: the template ships ad-hoc signed (`identity: null` +
   `afterPack.cjs`). For notarized builds add your Developer ID identity and notarization
   credentials to `electron-builder.yml` / workflow env.
4. **App icon**: replace `apps/web/public/brand/app-icon.svg`, then run
   `pnpm --filter @app/desktop generate-icon` (requires ImageMagick + iconutil) to rebuild
   `apps/desktop/build/icon.icns`.

## Rehearsal

`pnpm release:desktop:dry-run` runs the whole pipeline locally (build, package, sign, appcast)
without publishing.
