# LG Compliance Challenge 2026

Original campaign interface restored for GitHub Pages, with Supabase Auth and a server-side campaign engine.

The portal includes the original journey, both Stage 2 routes, rankings, badge gallery and practice, popular voting, onboarding roulette and investigation, camps, Compliance Detective, the collective summit challenge and administration. Original artwork is copied without alteration. GitHub Pages paths are rewritten only during the build.

## Run and deploy

Use Node 22 or newer. Run `npm ci` and `npm test`. Publish `dist/` with the included GitHub Pages workflow. `public-config.json` contains only the Supabase URL and publishable key. All Supabase dependencies are pinned.

The `campaign` Edge Function verifies the user's JWT with Supabase Auth and checks the live session and private employee allowlist in Postgres. Question keys, employee data, progress, votes and backups remain in the private schema. Concurrent writes use an atomic revision check. Official timing and scoring run on the server. The legacy Python file store is no longer required.

Deploy the SQL migration and the `campaign`, `identifier-login`, and `manual-activation` functions. Load the original question packs into `cc_private.campaign_content` through an operator-controlled private channel; do not commit the answer keys or employee directory. Administrative roles are provisioned separately from participant imports.

## Access

Participants may enter with their corporate email, employee ID, or registered payroll number. Sessions stay in the current browser tab. Password changes revoke existing sessions. The original homepage stays at `index.html`.

While SMTP is deferred, an administrator can issue a single-use activation/recovery code from the original participant controls. The recipient chooses their password at `account.html?activate=1`. Codes expire after 24 hours; only their hashes are stored. No automatic recovery email is claimed or sent. The personal Hotmail address is not used as an application identity.

## Validation

The restored engine was checked against all 40 original mission specifications, a complete 30-mission journey, duplicate submissions, badge awards, practice, onboarding, camps, investigations, summit, voting and administrative scope. Live Supabase checks cover identifier login, session validation, persistent progress, privacy and role restrictions. `npm test` checks the original dashboard DOM and deployment paths without loading or processing images.

The supplied original uses inline scripts and event handlers. Its CSP permits those scripts and restricts connections to this site and the configured Supabase origin. No service-role key or private question pack is included in the Pages build.


## CSS maintenance

- `site/assets/design-system.css`: shared tokens, components, admin table structure and motion preferences.
- `site/assets/dashboard.css`: dashboard layout, achievement artwork, voting fallback and participant table decoration.
- `site/assets/story-overlays.css`: ranking and story overlays.
- `site/assets/visual-review.css`: final responsive layout, column proportions, typography and semantic action styles.

Keep stylesheet order when editing HTML: later rules intentionally finish earlier component styles. Add changes to the owning stylesheet instead of introducing another numbered patch file. Remaining module styles are still referenced by their pages. Run `npm test` before publishing; the stylesheet check catches missing files and duplicate stylesheet links.
