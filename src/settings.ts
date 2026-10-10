import { App, PluginSettingTab, Setting } from 'obsidian';
import {
	FORMAT_LONG,
	FORMAT_SAMPLES,
	FORMAT_SHORT,
	isTimestampFormat,
	type TimestampFormat,
} from './format';
import type FileExplorerTimestampsPlugin from './main';

export interface FileExplorerTimestampsSettings {
	/** Master switch: render modification times in the file explorer. */
	showTimestamps: boolean;
	/** Which of the two supported layouts to use. */
	format: TimestampFormat;
}

export const DEFAULT_SETTINGS: FileExplorerTimestampsSettings = {
	showTimestamps: true,
	format: FORMAT_SHORT,
};

/**
 * Coerces persisted data — which may be missing, partial or hand-edited — back
 * into a complete, valid settings object.
 */
export function normalizeSettings(
	data: unknown,
): FileExplorerTimestampsSettings {
	const stored = (data ?? {}) as Partial<FileExplorerTimestampsSettings>;

	return {
		showTimestamps:
			typeof stored.showTimestamps === 'boolean'
				? stored.showTimestamps
				: DEFAULT_SETTINGS.showTimestamps,
		format: isTimestampFormat(stored.format)
			? stored.format
			: DEFAULT_SETTINGS.format,
	};
}

export class TimestampSettingTab extends PluginSettingTab {
	private readonly plugin: FileExplorerTimestampsPlugin;

	constructor(app: App, plugin: FileExplorerTimestampsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Show modification time')
			.setDesc(
				'Display the last modified time next to each file in the file explorer.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showTimestamps)
					.onChange(async (value) => {
						this.plugin.settings.showTimestamps = value;
						await this.plugin.saveSettings();
						this.plugin.applySettings();
						// Re-render so the format control reflects the new state.
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName('Time format')
			.setDesc('Layout used for the modification time.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption(FORMAT_SHORT, FORMAT_SAMPLES[FORMAT_SHORT])
					.addOption(FORMAT_LONG, FORMAT_SAMPLES[FORMAT_LONG])
					.setValue(this.plugin.settings.format)
					.setDisabled(!this.plugin.settings.showTimestamps)
					.onChange(async (value) => {
						if (!isTimestampFormat(value)) return;
						this.plugin.settings.format = value;
						await this.plugin.saveSettings();
						this.plugin.applySettings();
					}),
			);
	}
}
