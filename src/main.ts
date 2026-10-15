import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	TimestampSettingTab,
	normalizeSettings,
	type FileExplorerTimestampsSettings,
} from './settings';
import { TimestampController } from './explorer/controller';

export default class FileExplorerTimestampsPlugin extends Plugin {
	settings: FileExplorerTimestampsSettings = { ...DEFAULT_SETTINGS };

	private controller: TimestampController | null = null;
	private settingTab: TimestampSettingTab | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

		// The controller attaches itself to whatever file-explorer panels exist
		// now and follows the layout from there, so nothing here depends on the
		// explorer already being on screen.
		this.controller = new TimestampController(
			this,
			() => this.settings,
			() => void this.setShowTimestamps(!this.settings.showTimestamps),
		);
		this.controller.start();

		this.settingTab = new TimestampSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
	}

	onunload(): void {
		// Registered listeners clean themselves up; observers and injected
		// elements do not, so hand them back explicitly.
		this.controller?.destroy();
		this.controller = null;
		this.settingTab = null;
	}

	/** Called by the settings tab once a value changed. */
	applySettings(): void {
		this.controller?.applySettings();
	}

	/** Shared by the explorer toolbar and the settings tab. */
	async setShowTimestamps(value: boolean): Promise<void> {
		if (this.settings.showTimestamps === value) return;
		this.settings.showTimestamps = value;
		this.applySettings();
		this.settingTab?.display();
		await this.saveSettings();
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async loadSettings(): Promise<void> {
		this.settings = normalizeSettings(await this.loadData());
	}
}
