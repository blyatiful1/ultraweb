## Worked example — Framewalk, Steam-launch site for "Hollow Cartographer"

Prompt read: "site for my indie game Hollow Cartographer, launching on Steam — needs a devlog and a way for people to hear about launch."

Guided-mode interview (one round, three questions — the prompt already fixed the devlog and launch-news forks): press kit? (yes — streamers are the launch channel); devlog imported or fresh? (fresh, MDX); wishlist CTA straight to Steam or an email gate first? (straight to Steam — never gate the primary conversion). Each answer lands below as a decision, attributed "user, interview R1".

- **Site type & energy budget:** product/marketing (one game), *clarity first + one wow* — the wow is the hero, not the chrome.
- **Audience:** "a 29-year-old atmospheric-exploration fan clearing her Steam discovery queue at 11pm on a laptop — distrusts indie trailers that over-promise and ship vaporware." `copywriting` and `social-proof` build against that distrust with a real devlog cadence, not adjectives.
- **Conversion:** primary "Wishlist on Steam"; secondary launch-news email capture. Every page serves one or the other.
- **Tone:** hushed, cartographic, ominous — tension pair *eerie but inviting*. Sample line: "You are the last person to map a place that does not want to be mapped." (Rejected "atmospheric, immersive, polished" — survives the swap test, so worthless.)
- **Pages:** `/` (hook + wishlist), `/game` (what it is + system reqs), `/devlog` + `/devlog/[slug]` (proof of progress), `/press` (assets + fact sheet).
- **Backend: needs** → `content-cms` (MDX devlog) · `server-actions` + `email` (launch-news capture). **Rejected** → `payments` (the "buy" is an external Steam link, not our checkout); `database`/`auth` (no accounts, no per-user state).

Rejected alternative: a second filled "Buy on Steam" CTA beside Wishlist — pre-launch there is nothing to buy, and a competing button splits intent; the direction's rule is one primary CTA everywhere.

Handoff: lands in `design/BRIEF.md`; `ultraweb:direction` reads §Site type + the *eerie but inviting* tension to shortlist the Atmospheric-Dark archetype, and `ultraweb:sitemap` expands §Pages into the five routes.
