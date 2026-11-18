# Workspace review

## Issues fixed

| Area          | Issue                                                                                                       | Result                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Progress      | A shared browser cache could mix different accounts                                                         | Recovery is scoped to the authenticated account                                                                     |
| Saves         | Failed responses were ignored and could overwrite good data                                                 | HTTP failures are visible; explicit retries and offline recovery are available                                      |
| Concurrency   | Debounced full snapshots could overwrite newer device edits                                                 | Serialized writes use server revisions and reapply only explicit local edits on conflict                            |
| React state   | Storage and requests ran inside state updater functions                                                     | Side effects run outside React updaters; stale account requests cannot publish state                                |
| Data identity | Reordering questions changed saved completion IDs                                                           | Every existing question now has an explicit ID, preserving its previous value                                       |
| Validation    | Invalid question IDs could inflate scores; malformed bodies failed unpredictably                            | APIs validate body shapes, sizes, revisions, IDs, usernames, handles, and avatar inputs                             |
| Profile       | Setup POST bypassed rename cooldowns                                                                        | Setup is idempotent; renames use the validated PATCH path and atomic cooldown conditions                            |
| Recovery      | Profile, onboarding, and ranking requests could remain stuck after errors                                   | Loading, error, timeout, and retry states now cover these paths                                                     |
| Links         | Problem URLs were guessed from titles                                                                       | Practice uses search destinations unless the sheet supplies an explicit link                                        |
| Activity      | Repeated toggling inflated activity; current streaks became stale                                           | First completions are recorded once, and streaks are recalculated from UTC activity dates                           |
| Calendar      | Weekday labels occupied a whole calendar column and UTC/local dates were mixed                              | Weekdays have their own rail; calendar dates consistently use UTC                                                   |
| Badges        | Halfway disappeared after further progress; an early-user badge was never awarded; FAANG included Microsoft | Halfway persists while at least half is solved; the unreachable badge was removed; company membership was corrected |
| Rankings      | Missing profiles caused skipped ranks and consumed top-50 slots                                             | Profiles are joined before limiting, ties are deterministic, and ranks are contiguous                               |
| Privacy       | Ranking responses exposed authentication IDs                                                                | Ranking responses use public profile fields and an `isMe` flag                                                      |
| Companies     | Parsing company arrays as free text silently discarded unknown names                                        | Exact tags are preserved, with initial fallbacks when no logo is known                                              |
| Membership    | Paid features, a past launch date, payments, and email notifications were presented without implementations | Membership now accurately describes the free features that work                                                     |
| Mobile        | Wide question tables and profile panels hurt usability                                                      | Responsive controls and question rows fit the viewport; practice links remain accessible                            |
| Accessibility | Missing field names, unsafe resets, weak focus handling, and broken avatar fallbacks                        | Explicit labels, keyboard-accessible dialogs, a skip link, reduced motion, and fallback avatars                     |
| Builds        | Font downloads required network access at build time                                                        | Both fonts are self-hosted with their open-source licenses                                                          |
| Database      | A failed connection promise was cached forever, and missing env values threw during module import           | Connections initialize lazily and can recover after failure                                                         |
| Dependencies  | Installed Next.js and Mongoose versions had known advisories                                                | Updated to Next.js 16.4.6 and Mongoose 9.12.2; the final dependency audit reports zero vulnerabilities              |
| Structure     | Static GitHub Pages deployment and README instructions contradicted server-backed auth and APIs             | CI validates the full Next.js app; documentation describes server deployment                                        |
| Maintenance   | An obsolete email migration deleted usernames required by the active schema                                 | Removed the incompatible migration and empty identity modules                                                       |

## Experience improvements

The app now has a consistent black workspace with forest green cards and mint accents, clearer typography, topic cards, a continue-practicing panel, search across all questions and companies, CSV exports, explicit save status, polished onboarding, and responsive profile and community views.

## Verification

- TypeScript and formatting checks pass.
- 13 API and core tests pass.
- 18 browser scenarios pass across desktop and mobile, including offline recovery, conflict handling, storage failures, account separation, filtering, keyboard navigation, onboarding, and profile recovery.
- Production build passes with self-hosted fonts.
- Read-only connectivity to the configured MongoDB succeeds.
- Live Clerk middleware requests timed out on this machine. Isolated tests verify API authentication guards and the dashboard flows, but live account sign-in and live authenticated database writes were not verified.

Existing data was not migrated or reset. Authentication IDs and all 375 existing progress IDs are preserved. Older progress documents acquire the new revision and activity-tracking fields on their next save.
