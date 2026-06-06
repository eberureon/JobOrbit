export const APPLICATION_STATUSES = [
	"Applied",
	"Interview",
	"Offer",
	"Rejected",
	"Accepted",
	"Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Stats {
	total: number;
	last7Days: number;
	last30Days: number;
	statusBreakdown: Record<ApplicationStatus, number>;
	funnel: {
		applied: number;
		interview: number;
		offer: number;
		accepted: number;
		rejected: number;
		withdrawn: number;
	};
	timeline: { date: string; count: number }[];
	topCompanies: { company: string; count: number }[];
}

export const SORT_ORDER = ["newest", "a-z", "follow-up"];
export enum SORT_KEY {
	APPLIED_DATE = "applied_date",
	COMPANY = "company",
	STATUS = "status",
}

export type SortOrder = (typeof SORT_ORDER)[number];
export type SortKey = (typeof SORT_KEY)[keyof typeof SORT_KEY];
