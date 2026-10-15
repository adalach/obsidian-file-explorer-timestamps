# File Explorer Timestamps

Display the last modified time of every file directly in Obsidian's native file explorer.

A lightweight plugin that makes it easy to find recently edited notes and attachments — without switching to a separate file manager or changing your existing workflow.

## Preview

Each file displays its last modified time next to its name:

```text
Notes/
  Daily/
    2026-10-08.md        10-08 21:14
    2026-10-09.md        10-09 13:45
  Papers/
    attention.pdf        09-30 08:02
```

The timestamps appear directly in Obsidian's built-in Files sidebar.

## Features

- **Native file explorer integration** — Displays timestamps directly alongside file names, without replacing the built-in file tree.
- **One-click visibility toggle** — A clock icon beside the built-in file explorer actions shows or hides timestamps without disabling the plugin. The choice stays in sync with settings and persists after a restart.
- **All file types** — Supports Markdown notes, PDFs, images, and other files in your vault.
- **Automatic updates** — Refreshes timestamps when files are modified, created, renamed, or moved.
- **Preserves native interactions** — Keeps standard file navigation, drag-and-drop, renaming, and context menus.
- **Theme-aware appearance** — Uses Obsidian's muted text color to blend into light and dark themes.
- **Compact sidebar support** — Automatically hides timestamps when the sidebar becomes too narrow.
- **Lightweight and offline** — No network requests or third-party runtime dependencies.

## Settings

| Setting | Default | Description |
|---|---|---|
| Show modification time | Enabled | Show or hide timestamps in the file explorer. |
| Time format | `MM-DD HH:mm` | Choose between `MM-DD HH:mm` and `YYYY-MM-DD HH:mm`. |

All timestamps are displayed in your local time zone.

Click the clock icon beside the file explorer's sort and collapse controls to show or hide timestamps. The highlighted icon means timestamps are visible. The control remains available when timestamps are hidden, including in additional file explorer panels.

## Installation

### Community Plugins

Once the plugin is available in the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins → Browse**.
2. Search for **File Explorer Timestamps**.
3. Select **Install**, then enable the plugin.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest GitHub release](https://github.com/zhmchan/obsidian-file-explorer-timestamps/releases/latest).
2. Create the following folder inside your vault:

   `<Vault>/.obsidian/plugins/file-explorer-timestamps/`

3. Copy the three files into that folder.
4. Restart or reload Obsidian.
5. Enable **File Explorer Timestamps** under **Settings → Community plugins**.

## Compatibility

- Requires Obsidian 1.4.0 or later.
- Primarily tested on Obsidian Desktop.
- Mobile compatibility has not yet been fully verified.
- Works with both light and dark themes.

Timestamps are hidden when the file explorer sidebar is narrower than 160 pixels.

**Note:** This plugin enhances Obsidian's existing file explorer through DOM decoration. Future Obsidian updates that change the file explorer's internal structure may require compatibility updates.

## How It Works

Obsidian does not currently provide a public API for adding custom elements to native file explorer rows.

This plugin uses a minimal DOM enhancement approach:

1. Reads modification times from Obsidian's Vault API (`TFile.stat.mtime`).
2. Adds a lightweight timestamp element to each file row.
3. Uses `MutationObserver` to detect changes in the file explorer.
4. Listens for Vault events to keep timestamps synchronized.
5. Removes injected elements and event listeners when the plugin unloads.
6. Adds a small toggle to each file explorer header; it changes the same saved setting as the settings tab.

The native file explorer is preserved, and no note content is modified.

## Privacy

File Explorer Timestamps works entirely offline.

- No network requests.
- No analytics or telemetry.
- No collection or transmission of personal information.
- No modification of note content.
- File timestamps are read through Obsidian's Vault API.

## Development

Built with TypeScript and the official Obsidian Plugin API.

```bash
npm install
npm run dev
npm run build
npm run lint
```

Project structure:

```text
src/
  main.ts
  settings.ts
  format.ts
  explorer/
    controller.ts
    toolbar-toggle.ts
    view-decorator.ts
```

## Limitations

The current version focuses on displaying file modification times.

The following features are not yet supported:

- Modification timestamps for folders.
- Sorting files by modification time.
- File version history.

## License

MIT License. See [LICENSE](LICENSE) for details.
