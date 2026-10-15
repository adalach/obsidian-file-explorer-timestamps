# File Explorer Timestamps — Agent Instructions

## Project

File Explorer Timestamps is an Obsidian community plugin that displays file modification timestamps directly in the native file explorer.

- Language: TypeScript
- Build tool: esbuild
- Package manager: npm
- Plugin ID: `file-explorer-timestamps`
- License: MIT

## Architecture

- `src/main.ts`: Plugin lifecycle
- `src/settings.ts`: Settings and persistence
- `src/format.ts`: Timestamp formatting
- `src/explorer/controller.ts`: Explorer panels and Vault events
- `src/explorer/toolbar-toggle.ts`: Persistent file explorer header toggle
- `src/explorer/view-decorator.ts`: DOM decoration
- `styles.css`: Timestamp appearance

Keep modules focused and avoid unnecessary dependencies.

## Core Constraints

1. Preserve the native Obsidian file explorer.
2. Use public Obsidian APIs for file metadata and events.
3. Read modification times from `TFile.stat.mtime`.
4. Do not use undocumented Obsidian internal APIs.
5. DOM decoration must be minimal, idempotent and reversible.
6. Support multiple file explorer panels.
7. Prevent MutationObserver feedback loops.
8. Clean up all observers, listeners and injected elements on unload.
9. Do not modify note contents or send vault data over the network.
10. Preserve native file explorer interactions.

## Development

Before making changes, inspect the existing implementation.

Required checks:

```bash
npx tsc --noEmit
npm run build
npm run lint
```

Do not claim real Obsidian UI testing has passed unless it was actually performed.

Prefer small, focused changes over architectural rewrites.

## Compatibility

- Respect the minimum Obsidian version in `manifest.json`.
- Desktop compatibility is the primary validation target.
- Do not claim mobile support without testing.
- Avoid introducing Node.js or Electron runtime dependencies.

## Versioning and Release

Keep these files synchronized:

- `package.json`
- `manifest.json`
- `versions.json`

Release tags must match `manifest.json` exactly, without a `v` prefix.

GitHub releases must contain:

- `main.js`
- `manifest.json`
- `styles.css`

Do not commit generated build artifacts unless explicitly required.

## Git Workflow

- Default branch: `main`
- Repository: `zhmchan/obsidian-file-explorer-timestamps`
- Git author: use repository-local configuration
- Never overwrite global Git configuration
- Never infer plugin authorship from global Git configuration
- Do not automatically commit, tag, push or publish releases without explicit instruction
