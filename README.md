# DSA Sheet Workspace

An authenticated study workspace for the Apna College DSA sheet: 375 questions across 16 topics. Built with Next.js, React, Clerk, and MongoDB.

## Local development

Use Node.js 22 or newer. Copy `.env.example` to `.env.local`, then configure your Clerk keys and MongoDB URI. Enable your chosen sign-in methods in Clerk.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Sign in and choose a public username to begin.

## Checks

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

The browser suite runs the real dashboard and progress hook in an isolated client harness with mocked authentication and API responses. It checks desktop and mobile layouts, searching, filters, reset confirmation, offline recovery, concurrent edits, account separation, profile errors, and onboarding. It never connects to the production database. Screenshots are written to `.qa/`.

Unit tests cover scoring, milestones, UTC streaks, input validation, cached recovery, and merge behavior. GitHub Actions runs these checks and the production build. The CI build uses a nonfunctional compilation key unless the repository secret `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is configured. Hosting must always supply real keys.

## Behavior and data

- Solved questions sync to the signed-in account in MongoDB. Account-scoped browser storage retains unsaved edits for recovery; the save indicator reports sync failures and supports retries.
- Concurrent changes use a revision check. A conflicting save refreshes server progress and reapplies only the questions explicitly edited on this device.
- Activity counts each question's first recorded completion once. Repeatedly toggling a question does not inflate activity. Activity dates and streak boundaries use UTC.
- Usernames and avatars can change once every 30 days. Profile links accept handles or matching service profile URLs. Uploaded avatars accept PNG, JPEG, WebP, and GIF up to 250 KB.
- Practice links search LeetCode and GFG instead of guessing problem slugs. Add a verified `link` to a row in `data/sheet.ts` to override the primary practice destination.
- Question IDs are explicit and preserve existing saved progress. Keep each existing `id` unchanged when editing or reordering the sheet; assign a new unique ID to each added question.
- Company tags come from the source sheet; coverage percentages describe progress through those tagged questions, not hiring readiness. Logos load from Google's favicon service and have an initial fallback.
- The membership page describes the implemented free features. No payments or notification signups are implied.

## Deployment

Deploy as a full Next.js application on Vercel or a Node.js host. Configure the values in `.env.example` in the hosting environment, use production Clerk keys for production, and allow the host to reach MongoDB. `npm run build` writes `.next`; `npm start` serves it. Authentication and API routes require a server, so GitHub Pages and static exports are not supported.

Existing user IDs and progress IDs are preserved. New progress fields (`revision` and `trackedIds`) initialize when the account next saves. The obsolete email migration script was removed because it deleted usernames required by the active profile schema.
