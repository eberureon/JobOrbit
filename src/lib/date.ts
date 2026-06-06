export function toLocalDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export const formatMonthDay = (value: string) => {
	// Keep the original separator and only normalize day/month digits.
	// Accepts strings like "7/3" or "07.03" and returns "07/03" or "07.03".
	const match = /(\d{1,2})(\D+)(\d{1,2})/.exec(value);
	if (!match) return value;

	const day = match[1].padStart(2, "0");
	const separator = match[2];
	const month = match[3].padStart(2, "0");
	return `${day}${separator}${month}`;
};
