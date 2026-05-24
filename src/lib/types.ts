export const APPLICATION_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Accepted",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Stats = {
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
  };
  timeline: { date: string; count: number }[];
  topCompanies: { company: string; count: number }[];
};
