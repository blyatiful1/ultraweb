## Worked example — Tidepool, versioned read API for Fleet customers

design/BRIEF.md §Backend: needs — "Fleet-tier customers pull berth windows into their own dashboards: a keyable, versioned read API under `/api/v1`, documented on `/docs`." A partner's server is a non-browser consumer, so this endpoint wins a route handler over a server action.

`GET /api/v1/berths?port=NLRTM&window=7d` — searchParams validated with zod v4, Better Auth session gate first:

```ts
// app/api/v1/berths/route.ts
const querySchema = z.object({
  port: z.string().length(5, { error: "port must be a UN/LOCODE" }),
  window: z.enum(["24h", "7d", "30d"]).default("7d"),
});
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return apiError(401, "unauthorized", "API key required.");
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return apiError(400, "validation_failed", parsed.error.issues[0].message);
  return Response.json(await listBerths(parsed.data));
}
```

Rejected a server action for this read: actions are RPC bound to Tidepool's own forms and invisible to a partner's `curl` — a versioned GET route is the contract they build against. The route lands at `app/api/v1/berths/route.ts`; the hero's live berth timeline fetches it client-side (ultraweb:data-fetching) and `listBerths` is the Drizzle+Neon query from ultraweb:database.
