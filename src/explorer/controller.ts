import type { Plugin } from 'obsidian';
import { ExplorerViewDecorator } from './view-decorator';
import type { FileExplorerTimestampsSettings } from '../settings';

/** View type of the core file explorer. */
export const FILE_EXPLORER_VIEW_TYPE = 'file-explorer';

/**
 * A single vault event is enough to make one sweep worthwhile, but vault events
 * arrive in bursts (a sync tool writing hundreds of files, "save all", a batch
 * rename). Coalescing them keeps the work proportional to the burst rather than
 * to the number of events.
 */
const SWEEP_DELAY_MS = 100;

/**
 * Owns one {@link ExplorerViewDecorator} per open file-explorer panel and keeps
 * them in step with the vault and with the plugin settings.
 */
export class TimestampController {
	private readonly decorators = new Map<HTMLElement, ExplorerViewDecorator>();
	private sweepTimer: number | null = null;
	private vaultEventsRegistered = false;
	private active = false;
	private destroyed = false;

	constructor(
		private readonly plugin: Plugin,
		private readonly getSettings: () => FileExplorerTimestampsSettings,
	) {}

	start(): void {
		this.active = this.getSettings().showTimestamps;

		// Panels are opened, closed and moved at runtime; each change re-runs a
		// cheap reconciliation against the leaves that exist right now.
		this.plugin.registerEvent(
			this.plugin.app.workspace.on('layout-change', () => this.reconcile()),
		);

		// Vault subscriptions wait for the layout: subscribing during `onload`
		// would also collect the `create` event that the initial vault load
		// fires for every file, and none of that can be on screen yet.
		this.plugin.app.workspace.onLayoutReady(() => {
			if (this.destroyed) return;
			this.registerVaultEvents();
			this.reconcile();
		});

		this.reconcile();
	}

	/** Applies a settings change without reloading the plugin. */
	applySettings(): void {
		if (this.destroyed) return;

		this.active = this.getSettings().showTimestamps;

		if (!this.active) {
			this.teardown();
			return;
		}

		this.reconcile();
		this.refreshAll();
	}

	/** Re-syncs every decorated panel. */
	refreshAll(): void {
		if (!this.active) return;
		for (const decorator of this.decorators.values()) decorator.sync();
	}

	/** Unload. Listeners registered through the plugin are removed for us. */
	destroy(): void {
		this.destroyed = true;
		this.active = false;
		this.teardown();
	}

	/**
	 * Brings the set of decorators in line with the file-explorer panels that
	 * exist: one per panel, and none left behind for closed ones.
	 */
	private reconcile(): void {
		if (this.destroyed || !this.active) return;

		const liveContainers = new Set<HTMLElement>();

		for (const leaf of this.plugin.app.workspace.getLeavesOfType(
			FILE_EXPLORER_VIEW_TYPE,
		)) {
			const { containerEl } = leaf.view;
			if (!containerEl || liveContainers.has(containerEl)) continue;
			liveContainers.add(containerEl);

			if (this.decorators.has(containerEl)) continue;

			const decorator = new ExplorerViewDecorator(
				this.plugin.app,
				containerEl,
				this.getSettings,
			);
			this.decorators.set(containerEl, decorator);
			decorator.start();
		}

		for (const [containerEl, decorator] of this.decorators) {
			if (liveContainers.has(containerEl)) continue;
			decorator.destroy();
			this.decorators.delete(containerEl);
		}
	}

	private registerVaultEvents(): void {
		if (this.vaultEventsRegistered) return;
		this.vaultEventsRegistered = true;

		const { vault } = this.plugin.app;
		this.plugin.registerEvent(vault.on('create', () => this.scheduleSweep()));
		this.plugin.registerEvent(vault.on('modify', () => this.scheduleSweep()));
		this.plugin.registerEvent(vault.on('delete', () => this.scheduleSweep()));
		this.plugin.registerEvent(vault.on('rename', () => this.scheduleSweep()));
	}

	/**
	 * Modification times change without touching the DOM, so the observer in
	 * {@link ExplorerViewDecorator} cannot notice them; vault events drive these
	 * sweeps instead. The sweep re-reads every rendered row, which is also what
	 * makes renames and deletions correct without extra bookkeeping.
	 */
	private scheduleSweep(): void {
		if (this.destroyed || !this.active || this.sweepTimer !== null) return;

		this.sweepTimer = window.setTimeout(() => {
			this.sweepTimer = null;
			this.refreshAll();
		}, SWEEP_DELAY_MS);
	}

	/** Removes every decoration and stops observing. */
	private teardown(): void {
		if (this.sweepTimer !== null) {
			window.clearTimeout(this.sweepTimer);
			this.sweepTimer = null;
		}

		for (const decorator of this.decorators.values()) decorator.destroy();
		this.decorators.clear();
	}
}
