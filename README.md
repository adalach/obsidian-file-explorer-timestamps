# File explorer timestamps

Show the last modified time next to every file in Obsidian's native file
explorer — no separate file manager, no changes to your notes.

```
Notes/
  Daily/
    2026-10-08.md        10-08 21:14
    2026-10-09.md        10-09 13:45
  Papers/
    attention.pdf        09-30 08:02
```

## Features

- Adds a muted timestamp to each file row of the built-in **Files** view.
- Works for every file in the vault — Markdown, PDF, images and any other
  attachment.
- Updates on its own: saving a note, renaming, deleting, moving or creating a
  file is reflected in the tree within a moment.
- Keeps the native tree intact. Clicking, dragging, dropping, renaming and the
  right-click menu all behave exactly as before.
- Follows the theme — the time is drawn with Obsidian's own muted text colour,
  so it reads correctly in both light and dark modes.
- Starts and stops cleanly: disabling the plugin removes every element it
  added and every listener it registered.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| **Show modification time** | on | Master switch for the timestamps. |
| **Time format** | `MM-DD HH:mm` | `MM-DD HH:mm` (for example `10-09 13:45`) or `YYYY-MM-DD HH:mm` (for example `2026-10-09 13:45`). |

Times are shown in your local time zone.

## Installation

### From the community plugins list

Once the plugin is published: **Settings → Community plugins → Browse**, search
for *File explorer timestamps* and install it.

### Manually

1. Download `manifest.json`, `main.js` and `styles.css` from the
   [latest release](../../releases/latest).
2. Put them in `<Vault>/.obsidian/plugins/file-explorer-timestamps/`.
3. Reload Obsidian and enable **File explorer timestamps** in
   **Settings → Community plugins**.

## How it works

Obsidian does not expose an API for decorating file explorer rows, so the plugin
takes the smallest possible route through the rendered DOM:

- It finds the file explorer panels through
  `workspace.getLeavesOfType('file-explorer')` and appends one `<span>` to each
  `.nav-file-title` row, reading the vault path from the row's `data-path`
  attribute and the time from `TFile.stat.mtime`.
- A `MutationObserver` on `childList` follows the tree as it is re-rendered —
  expanding and collapsing folders, filtering, renaming, reordering — and
  re-decorates whatever the explorer rebuilt. The sweep is idempotent, so a
  change that is already on screen is never written twice and the observer
  cannot feed itself.
- Modification times change without any DOM change, which an observer cannot
  see. Vault `create`, `modify`, `rename` and `delete` events drive those
  updates instead. Events are coalesced into at most one sweep every 100 ms, so
  a bulk operation stays cheap.
- Nothing is cached across sweeps except the values last rendered onto a row, so
  a rename that rewrites `data-path` needs no special handling: the next sweep
  simply re-reads the path.
- One decorator per file explorer panel — including panels in pop-out windows —
  is created and destroyed as panels come and go.

Everything is scoped to the classes `fet-timestamp` and `fet-active`, and all
listeners, observers and injected elements are removed in `onunload()`.

## Privacy

The plugin works entirely offline. It makes no network requests, collects no
telemetry, reads nothing outside the vault, and never writes to or modifies your
notes — it only reads file metadata that Obsidian has already loaded.

## Compatibility

- Obsidian 1.4.0 or later. Only vault and DOM APIs that exist on both
  desktop and mobile are used, so `isDesktopOnly` is `false`.
- No third-party runtime dependencies.
- If the sidebar is narrower than 160 px, timestamps are hidden so that file
  names keep their full width.

## Development

```bash
npm install
npm run dev     # rebuild on change
npm run build   # type-check and produce main.js
npm run lint
```

Source layout:

```
src/
  main.ts                     # plugin lifecycle
  settings.ts                 # settings, defaults, settings tab
  format.ts                   # timestamp formatting
  explorer/
    controller.ts             # panels, vault events, lifecycle
    view-decorator.ts         # DOM decoration of one panel
```

## Not (yet) implemented

- Timestamps on folder rows.
- Sorting or filtering the tree by time.
- File versioning, or any history beyond the last modified time.

## License

[0-BSD](LICENSE)
