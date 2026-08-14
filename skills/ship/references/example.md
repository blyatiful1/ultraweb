## Worked example — Loop & Thread, shipping the textiles shop to production

design/QA.md handed up all gates green; design/SITEMAP.md lists `/`, `/shop`, `/products/aran-throw`, `/journal`, `/about`. Env enumeration returns exactly the eight keys the code reads, each an obvious placeholder in .env.example:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxx              # Stripe dashboard → developers
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx            # prod endpoint differs from the dev CLI secret
DATABASE_URL=postgresql://user:password@host/db # Neon → connection string
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://loopandthread.com       # Better Auth base URL — production domain
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxx       # Vercel → Storage → Blob (product photos)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx              # resend.com → API keys
NEXT_PUBLIC_SITE_URL=https://loopandthread.com  # public: shipped to the browser
```

Secret scan clean, `git check-ignore .env.local` exits 0. `npm run build` exit 0; `npm run start` then returns 200 for all five routes plus `/robots.txt` and `/sitemap.xml`, zero server errors. Only after the user answered "Deploying Loop & Thread to Vercel production — go?" do all eight keys go into the Vercel env and `npx vercel@56 --prod` run.

Rejected: reusing the Stripe CLI-forwarding `whsec_` for production — it never validates live events, so post-deploy I create a NEW webhook endpoint at the live `/api/stripe/webhook` with its own secret.

Handoff: the ship entry lands in design/QA.md and ultraweb:handoff runs next, documenting the deploy target and the eight audited keys.
