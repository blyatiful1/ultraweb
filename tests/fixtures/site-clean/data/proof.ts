export type ProofRecord = {
  status: "verified" | "sample";
  quote: string;
  attribution: { name: string; role?: string; company?: string };
  source: string;
  permission: "confirmed" | "unknown";
  verifiedAt: string;
};

export const proof: ProofRecord[] = [
  {
    status: "verified",
    quote: "The Yirgacheffe subscription survived our office of twelve — nobody argues about coffee anymore.",
    attribution: { name: "Mara Lindqvist", role: "Office Manager", company: "Fjordworks" },
    source: "mail thread 2026-03-12, forwarded by the client",
    permission: "confirmed",
    verifiedAt: "2026-03-14",
  },
];
