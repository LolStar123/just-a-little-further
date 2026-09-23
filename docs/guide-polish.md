# Guide and interaction pass, 23 September 2026

Implementation complete. Checks below combine rendered-page review, real-pointer tests and explicitly identified numerical checks. The publishing step verifies this source revision separately.

- [x] Varied card sums and all four suits; hover, press and held-pose ink motion.
- [x] Distinct quiet project music arrangements; slider and panel fades retained.
- [x] Guide appears on landing and invites scrolling; no redundant scroll label.
- [x] No guide teleports on scrolling, path rebuilds, resize or throw recovery.
- [x] Momentum, gravity, flapping and continuous return after a throw.
- [x] Contextual callouts; bounded repetition and quiet independent meows.
- [x] Terrain-based climb, leap, double kong, triple jump and land poses.
- [x] Research-loop shortcuts, moving-data hops, Botato ledge hang and release.
- [x] Clearly visible overhead paper.
- [x] Hardware meowl continuously carries GPUs into a growing prestarted pyramid.
- [x] Remove matrix; expanding colliding-interest thought bubble with five requested interests.
- [x] Smooth elastic tug and cleaner final flourishes.
- [x] Fractured hill pieces trace irregular terrain instead of regular pentagons.
- [x] Tilted craggy loading progress and slightly louder mechanical clicks.
- [x] Quote provenance without invented authors.
- [x] Desktop/mobile interaction review and error checks on the release build.

## Reference

Viewed successive video frames from https://www.youtube.com/watch?v=asDLDOW2vgQ .
Justin Roiland's Solo Vanity Card uses independent held ink/letter poses; Harmonious Claptrap follows it. Adapted the stepped hand-lettering technique, not its artwork, palette or audio.

Quote search: https://imginn.com/p/DcVHMnLKIpU/ reproduces a Stoic Forge post assigning the rematch wording to Epictetus. No work/chapter is supplied, so the site labels this as an unverified online attribution. Three notebook lines are original ChatGPT wording from this conversation history; the onion reminder was selected and refined by Atul. None is attributed to a famous writer without evidence.

## Added during review

- [x] Draggable line near text/iframes; no accidental text selection.
- [x] Quintic tension taper over the free line; no sudden cutoff.
- [x] Hide tiny tug dots but retain keyboard access.
- [x] Page-wide thrown props and helpers; cross-frame rendering, gravity, wire/text/object collisions.
- [x] Re-grab thrown items; distinguish held GPU/paper from meowl.
- [x] Strip redundant demo disclaimers and repeated status copy.
- [x] Readable landing invitation at the bottom corner; no scroll-invite label.
- [x] Guide actions read as local knowledge: research shortcut, data hop, ledge wait.

## Test protocol

Use real browser pointer down/move/up gestures, not only state injections. Run desktop and phone widths. Sample guide world coordinates during scroll and throws; inspect motion frames. Repeat hill drops until multiple fractures appear. Throw a GPU outside its iframe and re-grab it on the page. Check collisions against line and other props, clean release after cancellation, no text selection, and sound/animation visibility gating. Inspect screenshots before declaring visual completion. A passing syntax check is not user-experience evidence.

- [x] Supported-cliff failure after adjacent erosion; no immortal razor ridge.
- [x] Bounded wing/torso/neck reach when the boulder moves away.
- [x] One-second ballistic helper throws, bounces, then winged recovery.
- [x] Researcher sweat attached to the articulated body.
- [x] Rail-grinding pose, balance wings and restrained contact flecks.

### Physics interpretation

This is a stylised page playground. Thrown bodies collide in the page plane. During winged recovery, meowls rise above the thin-wire plane, route around text, then descend into their home pose. The final landing blend disables overlapping home hitboxes to avoid an endless collision loop. This is an explicit flight/landing rule, not a claim of a general 3D physics simulation. Tests must still verify continuous movement and no iframe clipping.


## Observed fixes from real-pointer testing

- A GPU pick selected a smaller card behind the held GPU. Fixed picking to use painter order, so the visible foreground object wins.
- SVG path-length queries stalled the first cross-frame throw. Replaced repeated geometry queries with cached sampled line points.
- The first return test left helpers short of home. Lift had been applied once per display frame while gravity ran in each substep. Force now runs on the same substeps; the repeated real throw returned all active bodies to zero within the 12-second observation.
- Narrow screens clipped the guide at the right edge. Added continuous boundary responses and inward route targets; expanded his transparent drawing canvas so flips do not cut off wings.
- Real hill drops reproduced debris clutter. Removed regular pentagons and stitched dangling loops; detached irregular ledge outlines now tumble separately while the eroded ridge remains one connected stroke.

## Verification evidence

- `output/card-polish/stress.json`: 9 visible scenes each at 1440x940 and 390x844, no browser errors or horizontal overflow; card sums/suits, rapid panel switching, text-safe tug/release, burst scroll and resize continuity. Maximum sampled guide travel speeds stayed below 1450 px/s without discontinuities.
- `output/card-polish/global-result.json`: physical GPU drag out of its iframe, collisions, re-grab on the outer page, no browser errors.
- `output/card-polish/helper-recovery.json`: real Baxter throw, loose sheet and subsequent collisions; no active bodies remaining after the 12-second recovery observation.
- `output/card-polish/interactions.json`: 14 actual boulder drags/drops; structural breaks and permanent erosion, visible shard review; elastic release settled below .002 px.
- Clipboard image inspected: the upper ridge remained unsupported after a local crater. Adjacent-support failure now propagates beyond the impact patch. Repeated-impact numerical test recorded 329 breaks and 246 px summit wear with finite state and 14-point irregular shards.

These observations are bounded tests, not a promise of perfect physics under every possible interaction. Sound testing checks successful playback, variation and gain routing; no human listening review is claimed.

- `output/card-polish/final-polish.json`: card hover/click animation active, landing invitations varied, 90 fixed-step downhill grinding frames, actual Botato hang/release, hardware stack advanced 30 to 35 with no position reset (maximum 130 px/s).
- Final mobile speech placement checks avoid project-copy rectangles; current screenshots reviewed after font and guide sizing changes.
- `npm run check` and `git diff --check` pass. The grinder route check is deterministic simulation; the other browser gestures described above use pointer/scroll input.

## Published verification

Version 36 is public. A fresh isolated Chrome session loaded the page, entered through the three-push screen and found the guide visible with no browser errors. Six deployed JavaScript assets matched the tested local files byte for byte. [Production check](qa/live-verification.json) and [test summaries](qa/) are included here; temporary recordings and private clipboard images are not.
