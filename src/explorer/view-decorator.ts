import { App, TFile } from 'obsidian';
import { formatTimestamp } from '../format';
import type { FileExplorerTimestampsSettings } from '../settings';

/**
 * Rows of the native file explorer that stand for a file. Obsidian stamps the
 * vault path of every row onto `data-path`; folder rows use the same attribute
 * on `.nav-folder-title`, which is why the selector is anchored on the file
 * variant. Both class names are part of Obsidian's long-standing tree markup
 * and are relied upon by many community plugins and themes.
 */
export const FILE_ROW_SELECTOR = '.nav-file-title[data-path]';

/** Class of the element appended to a decorated row. */
export const TIMESTAMP_CLASS = 'fet-timestamp';

/** Marks a file-explorer container that currently holds our decorations. */
export const ACTIVE_CONTAINER_CLASS = 'fet-active';

/** What we rendered onto a row, so repeated sweeps can skip untouched rows. */
interface RowDecoration {
	element: HTMLElement;
	mtime: number;
	format: string;
}

/**
 * Adds modification times to the rows of a single file-explorer panel.
 *
 * The file explorer has no public row-decoration API, so this works purely on
 * the rendered DOM: it appends a span to each `nav-file-title` and keeps that
 * span in step with the vault via a `MutationObserver`.
 */
export class ExplorerViewDecorator {
	private readonly rows = new WeakMap<HTMLElement, RowDecoration>();
	private observer: MutationObserver | null = null;
	private frame: number | null = null;
	private stopped = false;

	constructor(
		private readonly app: App,
		private readonly containerEl: HTMLElement,
		private readonly getSettings: () => FileExplorerTimestampsSettings,
	) {}

	/**
	 * Decorates what is rendered right now and starts watching for changes.
	 * Every later change reaches the DOM one way or another — rows added by an
	 * expand, rows updated by a rename, the whole tree re-rendered after a
	 * filter — so observing the container is enough to keep up. Callers only
	 * have to force a sweep for things that happen *without* a DOM change,
	 * which in practice means vault events (see `TimestampController`).
	 */
	start(): void {
		if (this.observer) return;

		this.containerEl.addClass(ACTIVE_CONTAINER_CLASS);

		// `childList` follows the tree being rebuilt (expanding, filtering,
		// sorting). `data-path` is watched on its own because a rename can
		// rewrite nothing but that attribute, and the path is what maps a row
		// back to a file. Nothing else is observed: we never write `data-path`
		// ourselves, and even a mutation that did originate from us leaves
		// `sync()` with nothing to do the second time round, so notifications
		// always settle instead of looping.
		this.observer = new MutationObserver(() => this.scheduleSync());
		this.observer.observe(this.containerEl, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-path'],
		});

		this.sync();
	}

	/** Stops observing and removes everything we added. */
	destroy(): void {
		this.stopped = true;

		if (this.frame !== null) {
			window.cancelAnimationFrame(this.frame);
			this.frame = null;
		}

		this.observer?.disconnect();
		this.observer = null;

		for (const element of Array.from(
			this.containerEl.querySelectorAll<HTMLElement>(
				`.${TIMESTAMP_CLASS}`,
			),
		)) {
			element.remove();
		}

		this.containerEl.removeClass(ACTIVE_CONTAINER_CLASS);
	}

	/**
	 * Reconciles every rendered row with the current vault and settings.
	 * Idempotent: rows already showing the right text are left untouched, and
	 * paths are always re-read from the DOM rather than cached, so a rename
	 * that rewrites `data-path` needs no special handling.
	 */
	sync(): void {
		if (this.stopped) return;

		const { format } = this.getSettings();

		for (const row of Array.from(
			this.containerEl.querySelectorAll<HTMLElement>(FILE_ROW_SELECTOR),
		)) {
			const path = row.getAttribute('data-path');
			const file = path ? this.app.vault.getAbstractFileByPath(path) : null;

			if (!(file instanceof TFile) || !Number.isFinite(file.stat.mtime)) {
				this.clearRow(row);
				continue;
			}

			const { mtime } = file.stat;
			const cached = this.rows.get(row);
			if (cached && cached.mtime === mtime && cached.format === format) {
				continue;
			}

			const element =
				cached && cached.element.parentElement === row
					? cached.element
					: row.createSpan({ cls: TIMESTAMP_CLASS });
			element.setText(formatTimestamp(mtime, format));

			this.rows.set(row, { element, mtime, format });
		}
	}

	private clearRow(row: HTMLElement): void {
		const cached = this.rows.get(row);
		if (!cached) return;

		if (cached.element.parentElement === row) cached.element.remove();
		this.rows.delete(row);
	}

	private scheduleSync(): void {
		if (this.stopped || this.frame !== null) return;

		this.frame = window.requestAnimationFrame(() => {
			this.frame = null;
			this.sync();
		});
	}
}
