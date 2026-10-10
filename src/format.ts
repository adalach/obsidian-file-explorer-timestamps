/**
 * Timestamp formatting.
 *
 * Deliberately dependency-free: `Date` getters give identical output on every
 * platform, in the user's local time zone, without pulling in a date library.
 * That keeps the bundle tiny and works on mobile.
 */

/** `MM-DD HH:mm` — compact, the default. */
export const FORMAT_SHORT = 'short';
/** `YYYY-MM-DD HH:mm` — always carries the year. */
export const FORMAT_LONG = 'long';

export type TimestampFormat = typeof FORMAT_SHORT | typeof FORMAT_LONG;

/** Specimen shown next to each option in the settings tab. */
export const FORMAT_SAMPLES: Record<TimestampFormat, string> = {
	[FORMAT_SHORT]: 'MM-DD HH:mm',
	[FORMAT_LONG]: 'YYYY-MM-DD HH:mm',
};

const VALID_FORMATS: readonly string[] = [FORMAT_SHORT, FORMAT_LONG];

export function isTimestampFormat(value: unknown): value is TimestampFormat {
	return typeof value === 'string' && VALID_FORMATS.includes(value);
}

function pad(value: number): string {
	return value < 10 ? `0${value}` : `${value}`;
}

/**
 * Formats a modification time (unix timestamp in milliseconds) for display.
 */
export function formatTimestamp(
	mtime: number,
	format: TimestampFormat,
): string {
	const date = new Date(mtime);
	const monthDay = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

	if (format === FORMAT_LONG) {
		return `${date.getFullYear()}-${monthDay} ${time}`;
	}
	return `${monthDay} ${time}`;
}
