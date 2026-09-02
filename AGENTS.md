# AGENTS.md — context for AI assistants working on this repo

You are likely being asked for help by **the person who uses this app to run his
fantasy football auction draft**. He is not a programmer. Answer in plain language,
avoid jargon, and prefer solutions he can do himself in the app's own interface
over solutions that require editing code, installing tools, or using a terminal.

If a fix does require a code change, note that changes must be made in the
**source** file and then rebuilt — see "Making changes" below. Editing
`index.html` directly is possible but strongly discouraged (it is minified).

---

## What this app is

A single-page web app for running a **fantasy football auction draft** (not a snake
draft). In an auction, every team has a budget and bids real dollars on players,
so the app's job is: find a player fast, record what he sold for, and always show
how much money and how many roster spots are left.

It replaced a Google Sheets auction board. The player list in the app came from
that spreadsheet.

**Core loop:** type a player's name → tap him → type the price → tap either
"I won — add to my team" or "Another team got them."

---

## Files in this repo

| File | What it is |
|---|---|
| `index.html` | **The app that actually runs.** Self-contained: React and all app code are bundled and minified inside this one file. This is what GitHub Pages serves. Do not hand-edit unless there is no alternative. |
| `auction-draft-board.jsx` | **The readable source code.** All logic and UI live here. Make changes here, then rebuild `index.html`. |
| `entry.jsx` | React mount plus the required `window.storage` to `localStorage` shim. |
| `player-projections.json` | Build-time snapshot of ESPN's 2026 PPR rank, projected points, ADP, current team, headshot URL, or defense-logo URL. Every built-in player has an explicit projected/not-projected status. |
| `assets/banner/` | Original, logo-free football snap/contact frames plus the generated seamless-loop laptop banner GIF. |
| `scripts/` | Deterministic app/banner builds, bundle verification, ESPN projection refresh, and projection coverage audit. |
| `package.json` | Pinned React/esbuild versions and the supported build/test commands. |
| `package-lock.json` | Exact dependency lock used by `npm ci`. Commit changes to it when dependencies change. |
| `draft-sync.gs` | Optional Google Apps Script for pushing draft results to a Google Sheet. Setup instructions are in the file's comments. Not required for the app to work. |
| `README.md` | Plain-language setup, draft-night use, recovery, and feature guide for the user. |
| `AGENTS.md` | This file. |

---

## How it's deployed

- Hosted on **GitHub Pages** from the `main` branch, root folder.
- The user opened the Pages URL in Chrome on a **Chromebook** and used
  **⋮ → Cast, save, and share → Install page as app**, so it has its own
  launcher/shelf icon and opens in its own window.
- There is **no server, no database, no login, no build step at runtime.**
  Everything runs in his browser.
- GitHub Pages is configured as a **legacy branch deploy** from `main` and `/`.
  If a push does not create a Pages run, request one explicitly with
  `gh api --method POST repos/TheFireSays/draft-board/pages/builds`, then verify
  the resulting Actions run and live file rather than assuming the push deployed.

---

## Where the data lives (important)

Current draft data is stored in the browser's **`localStorage`** under the key
`auction-draft-v1`. It holds a JSON object:
`{ picks, settings, customPlayers, targetIds, playerNotes }`.
The app also keeps up to 12 rotating five-minute recovery snapshots under
`auction-draft-auto-backups-v1` while the app is open and at least one pick
exists. Settings lets the user select and restore one of those snapshots.

Consequences worth knowing before you troubleshoot:

- The draft is stored **on his device only**. It is not in the cloud and not in
  this repo. You cannot see his draft data.
- **Clearing browsing data / cookies / site data will erase the current draft and
  all automatic recovery snapshots.**
  This is the single most likely cause of "my draft disappeared."
- localStorage is per-origin. A draft started at the GitHub Pages URL will not
  appear if he opens a local copy of the file, and vice versa.
- The app has a built-in remedy: **Settings → "Save a backup file"** writes
  `draft-backup.json` to Downloads, and **"Restore from a backup file"** reads it
  back. If he has a backup, recovery is a two-tap operation. If he doesn't,
  the data is unrecoverable — say so plainly rather than suggesting workarounds
  that won't work.

---

## Features he can use without any code changes

Point him at these before proposing anything technical:

- **A player is missing from the list.** Type the name in the search box. When
  nothing matches, an "add them" form appears — he picks the position, types the
  3-letter team, taps the add button. The custom player is saved permanently and
  behaves like any other player.
- **Wrong pick / typo in a price.** The **Undo** button on the draft screen
  reverses the most recent pick. It can be tapped repeatedly to walk back
  several picks.
- **Different league rules.** Settings has **starting budget** (default $100)
  and **roster size** (default 15).
- **Keep a watchlist.** Open a player and tap "Add to Targets." Undrafted
  Targets are automatically promoted within their position category without
  changing the saved player ranking inside the Target/non-Target groups. The
  Targets filter shows only the watchlist. Personal notes use the same card.
- **Duplicate-position reminder.** Drafting a second K or DEF shows an advisory
  warning but is intentionally allowed.
- **ESPN fantasy summary.** Each built-in player's card reads its status from
  `player-projections.json`. Projected players show 2026 overall PPR rank,
  projected fantasy points, and ADP with a visible ESPN source link. Players
  without a positive ESPN season projection explicitly say no projection is
  listed. Do not substitute NFL prospect grades or present ESPN data as the
  user's Max bid.
- **Complete scrolling lists.** Lists initially render in small batches and use
  an `IntersectionObserver` sentinel to load more as the user scrolls. The
  visible fallback button must continue to make all remaining results reachable.
- **ESPN supplemental pool.** `player-projections.json` includes stable `E-<ESPN
  player ID>` supplemental players for every ESPN player with a positive 2026
  projection that is absent from `RAW`, including all 32 defenses. Five
  additional players cover the union of the supplied ESPN, FantasyPros, and
  Yahoo top-300 references. Preserve previous supplemental entries during
  refreshes so saved picks remain valid.
- **Player identity.** Available-player rows and the bid modal use ESPN's current
  full team name. Individual players use ESPN CDN headshots; defenses use ESPN
  team logos. `PlayerAvatar` hides a failed image and leaves the colored
  position fallback visible. Media is remotely hosted, so loss of connectivity
  may remove the photo/logo but must never block drafting.
- **Get the results out.** Settings → "Download draft as CSV" (opens in Sheets
  or Excel). Also "Save a backup file" for the full restorable state.
- **Track acquisition order.** My Team shows a compact `#1`, `#2`, and so on
  beside won players using their index in `myPicks`. Undo/Remove naturally
  renumbers them; the CSV includes a separate `My Pick Order` column alongside
  overall draft order.
- **Start a new draft.** Settings → "Clear draft & start over" (it asks for
  confirmation). Suggest saving a backup first.

---

## How the app is built (source: `auction-draft-board.jsx`)

Single React function component, `AuctionDraftBoard`, default export. No router,
no state library, no CSS files — styles are inline JS objects in the `S` object
near the bottom of the component.

**Key structures:**

- `RAW` — player data as compact strings, one entry per position
  (`"Name|TEAM,Name|TEAM,..."`), keyed `QB, RB, WR, TE, K, DEF`.
- `PLAYERS` — `RAW` parsed into `{ id, name, team, pos, rank }`. IDs are
  `"POS-index"`, e.g. `"RB-0"`. **Player IDs are positional — if you reorder or
  delete entries in `RAW`, existing saved drafts will point at the wrong players.**
  Append new players to the end of a position's string rather than inserting.
- `SUPPLEMENTAL_PLAYERS` — projected ESPN players absent from `RAW`, loaded from
  `player-projections.json` and appended to `PLAYERS`. Their `E-<ESPN ID>` IDs
  are stable and must not be replaced with positional IDs.
- `customPlayers` — user-added players, IDs prefixed `"C-"` plus a timestamp.
- `ALL` — `PLAYERS` + `customPlayers`; this is what search reads from.
- `findP(id)` — safe lookup; returns an "Unknown player" placeholder rather than
  crashing if an ID isn't found (protects against restoring an old backup).
- `picks` — the draft log: `[{ playerId, price, mine, ts }]`. `mine: true` means
  he won the player; `false` means another team took him (still removed from the
  available pool). Bid input accepts digits only, and `sanitizePicks` clamps
  restored or previously saved prices to non-negative whole dollars.
- `targetIds` — player IDs in the saved Targets watchlist.
- `results` — filtered available players. Outside the dedicated Targets view,
  its stable sort groups the ALL list by `POSITION_ORDER` and promotes Targets
  within each position while preserving original rank order.
- `playerNotes` — object keyed by player ID; notes are capped at 300 characters.
- `settings` — currently `budget`, `rosterSize`, and `syncUrl`. Old saved
  objects may still contain ignored `ticker` or `rain` properties from builds
  before those visual features were removed.

**Responsive layout:** `wide` is driven by `(min-width: 900px)`. At laptop width,
the scoreboard includes the centered app title over an original, logo-free
football snap animation. Its two-second snap-to-contact-to-snap cycle has a
seamless boundary; the app freezes on the fourth collision pass after about
seven seconds by replacing it with the static contact PNG.
`prefers-reduced-motion: reduce` uses that PNG immediately. The phone scoreboard
remains solid green. Navigation is rendered immediately below the scoreboard
and sticks at the top while
scrolling, and a 360px live roster sidebar appears on the Draft tab. Below
900px, navigation is fixed at the bottom and the roster remains on the My Team
tab. The outer page background is the static neutral `#E8ECE6`; there is no
canvas animation. The bottom-right TheFireSays credit sits above phone
navigation and links to the GitHub profile.

**The budget math** (in `derive`-equivalent code near "Derived draft math"):

```
spent     = sum of prices where mine === true
remaining = settings.budget - spent
slotsLeft = settings.rosterSize - (count of my picks)
maxBid    = slotsLeft > 0 ? max(0, remaining - (slotsLeft - 1)) : 0
```

`maxBid` reserves $1 for every roster spot still to fill, so he can always
complete a legal roster. **Bids above `maxBid` show a red warning but are still
allowed** — this is intentional, because live auctions have corrections and
house rules. As a result `remaining` can legitimately go negative and display as
a negative dollar amount. Do not "fix" this without asking him first.

**Other components/functions:** `exportCsv`, `downloadBackup`, `restoreBackup`,
and a debounced `fetch` effect that POSTs draft state to `settings.syncUrl` when
set.

---

## Making changes

The runnable `index.html` is generated from the source. To change behavior:

1. Edit `auction-draft-board.jsx`. If changing the banner art, replace the two
   1180×180 PNG frames in `assets/banner/`; do not use branded game footage.
2. Install the pinned dependencies once, rebuild, and verify:

   ```bash
   npm ci
   npm run build
   npm test
   ```

   `npm run build` regenerates the seamless-loop `football-snap.gif` from those
   two PNG frames before rebuilding `index.html`.

3. Commit and push to `main`. GitHub Pages redeploys automatically in ~1 minute.
4. On the Chromebook, the installed app picks up the new version on next launch.
   If it appears stale, Ctrl+Shift+R forces a refresh.

**The `window.storage` shim matters:** the source calls `window.storage.get/set`
(an async key-value API). The bundle's entry file defines that on top of
`localStorage`. If you rebuild without the shim, saving silently stops working.

### Draft-day ESPN projections

ESPN data is a static build-time snapshot, not a live in-app dependency. The
updater reads ESPN's 2026 PPR fantasy projections and current pro-team mapping,
then matches names without reordering the board's positional IDs. It stores only
factual summary fields plus ESPN CDN media URLs: PPR rank, projected points, ADP,
team name, match status, and source metadata. It does not copy ESPN outlook
prose. Shortly before the September 5, 2026 draft, run:

```bash
npm run draft-day-refresh
```

That refreshes the ESPN snapshot, requires at least 95% name coverage and 175
positive projections, rebuilds `index.html`, and verifies the bundle. A player
without a positive projection remains in the board with an explicit
"No 2026 ESPN projection" message. Do not invent missing values.

### Reversible build checkpoints

The annotated `draft-build-*` tags are cumulative working checkpoints. Build 0
is the pre-enhancement baseline; later tags add the former ticker, Targets, advisory,
notes, the former news experiment, laptop layout, build verification, credit,
clean background,
top navigation, banner title, synchronized documentation, and the smooth football
banner animation, Target priority sorting, non-negative bid enforcement, My Team
acquisition order, and the player-focused-news checkpoint. The current
checkpoint is `draft-build-22-no-ticker`, which removes the recent-picks ticker
and its Settings control. Build 21 is the immediate rollback point for restoring
the ticker while keeping player headshots, current ESPN team names, and defense
logos; build 20 restores the ESPN-summary layout without remote player/team
images.
Use the tags to compare or restore a known build; do not rewrite or delete them
casually.

---

## Troubleshooting guide

| Symptom | Cause and response |
|---|---|
| "My draft disappeared" | Browsing data was cleared, or the app was opened from a different URL/origin. Restore from `draft-backup.json` in Downloads if one exists. If not, the draft is gone — tell him directly, then have him save backups during the next draft. |
| "A player isn't in the list" | Use the add-player form that appears when a search returns nothing. No code change needed. |
| "I entered the wrong price" | Undo the pick and re-enter it. |
| "It says I have negative money" | Expected behavior after bidding over the max bid. Undo the offending pick, or adjust the budget in Settings if the league's budget is actually higher. |
| "Nothing shows up in my Google Sheet" | Sheet sync is optional and off unless a URL is set. The app sends data without reading a response, so a bad URL fails silently. Re-check the Apps Script deployment (must be "Anyone" access) and re-paste the web app URL into Settings. See `draft-sync.gs`. |
| "The app won't open / white screen" | Have him open the GitHub Pages URL directly in Chrome. If that works, reinstall the app from the ⋮ menu. Draft data survives reinstalling. |
| "The latest changes are not live" | Confirm `origin/main`, inspect the newest Pages Actions run, and compare the live `index.html` with the local build. For legacy Pages, explicitly POST `repos/TheFireSays/draft-board/pages/builds` if no run was triggered. |
| "A headshot or defense logo is missing" | ESPN media is loaded remotely and may be unavailable offline or for a newly added/custom player. The colored position fallback is intentional; drafting remains fully functional. |

### Google Sheets sync setup

The field in Settings does **not** accept the normal Google Sheets browser URL.
It needs the deployed Google Apps Script **web app URL** created from
`draft-sync.gs`:

1. Open the destination Google Sheet.
2. Choose **Extensions → Apps Script**.
3. Replace the starter code with the contents of `draft-sync.gs`.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
6. Authorize the deployment and copy the resulting web app URL (normally ending
   in `/exec`).
7. Paste that URL into **Settings → Sheet sync URL** in the draft app.

If the user asks Gemini for help, walk them through those screens one at a time.
Never ask for their Google password or authorization code. A useful paste-ready
prompt is:

> Help me connect Load's Draft-o-matic to Google Sheets. Use the draft-sync.gs
> file in https://github.com/TheFireSays/draft-board. Walk me through opening
> Apps Script from my Google Sheet, pasting the code, deploying it as a web app
> with access set to Anyone, and tell me which web app URL to paste into the
> app's Sheet sync field.

---

## Things to be careful about

- Do not reorder or remove entries in `RAW` — it breaks saved drafts (see IDs above).
- Do not remove the `window.storage` shim when rebuilding.
- Do not add a login, account system, or backend. Zero-maintenance and
  no-support are explicit goals of this project.
- Do not reintroduce the digital-rain/canvas background unless explicitly asked;
  the clean static surround is a deliberate laptop-layout decision.
- Do not commit anything containing personal data; the repo is public.
- Prefer in-app solutions to code changes. A change he can make himself in
  Settings is always better than one that requires a rebuild and a push.
