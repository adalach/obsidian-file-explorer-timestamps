import { setIcon } from 'obsidian';

const BUTTONS_SELECTOR = '.nav-header .nav-buttons-container';
const TOGGLE_CLASS = 'fet-toolbar-toggle';

/** A persistent control next to the native file-explorer actions. */
export class ExplorerToolbarToggle {
	private button: HTMLElement | null = null;
	private observer: MutationObserver | null = null;
	private frame: number | null = null;
	private stopped = false;

	constructor(
		private readonly containerEl: HTMLElement,
		private readonly isEnabled: () => boolean,
		private readonly onToggle: () => void,
	) {}

	start(): void {
		if (this.observer) return;
		this.observer = new MutationObserver(() => this.scheduleSync());
		this.observer.observe(this.containerEl, { childList: true, subtree: true });
		this.sync();
	}

	updateState(): void {
		if (!this.button) return;
		const enabled = this.isEnabled();
		this.button.toggleClass('fet-toolbar-toggle-active', enabled);
		this.button.setAttribute('aria-pressed', String(enabled));
		const label = `${enabled ? 'Hide' : 'Show'} file timestamps`;
		this.button.setAttribute('aria-label', label);
		this.button.setAttribute('title', label);
	}

	destroy(): void {
		this.stopped = true;
		if (this.frame !== null) window.cancelAnimationFrame(this.frame);
		this.frame = null;
		this.observer?.disconnect();
		this.observer = null;
		this.button?.remove();
		this.button = null;
	}

	private sync(): void {
		if (this.stopped) return;
		const buttons = this.containerEl.querySelector<HTMLElement>(BUTTONS_SELECTOR);
		if (!buttons) return;
		if (this.button?.parentElement !== buttons) {
			this.button?.remove();
			this.button = buttons.createDiv({ cls: `clickable-icon nav-action-button ${TOGGLE_CLASS}` });
			this.button.setAttribute('role', 'button');
			this.button.setAttribute('tabindex', '0');
			setIcon(this.button, 'clock');
			this.button.addEventListener('click', (event) => {
				event.stopPropagation();
				this.onToggle();
			});
			this.button.addEventListener('keydown', (event) => {
				if (event.key !== 'Enter' && event.key !== ' ') return;
				event.preventDefault();
				event.stopPropagation();
				this.onToggle();
			});
		}
		this.updateState();
	}

	private scheduleSync(): void {
		if (this.stopped || this.frame !== null) return;
		this.frame = window.requestAnimationFrame(() => {
			this.frame = null;
			this.sync();
		});
	}
}
