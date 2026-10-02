# Just a little further

Atul's personal sketchbook: a stubborn meowl pushes a boulder, and one wandering pen line leads into his projects. The page's job is to make the work easy to find without sanding off its personality.

## The page

Keep the existing wonky title and hillside. The entrance requires three deliberate pushes, with readiness tracked separately from the push count. The hero has profile links, quiet music/effects sliders and the four playground controls. No quote block, hill poker-card navigation or Poetato Discord link belongs here.

Below the hill, nine project stops cover ten projects: Tube reliability and commute costs share a London drawing; research, PoE prices, Smoothtato, Deadlock, Baxter, Botato, HALO and hardware follow. The last scene is the interests thought bubble. Keep current user-confirmed captions, public source links and demo scope distinct from illustrative scene data.

Desktop keeps the alternating sketchbook reading flow. On screens at or below 760px, place one native folded `details` jump list after the invitation and before the first project. It sticks 8px from the viewport top only within the sketchbook. It links to existing chapters, closes on selection or Escape and moves focus to the chosen chapter. It adds no second project drawer or hero index. Chapter scroll margins leave the folded control visible above the destination.

## Type, colour and spacing

- Paper `#eeeae0`, ink `#3b3a36`, muted ink `#69675e`, olive `#60715d`, ochre `#8b7248` and clay `#936957`. Text uses ink or muted ink at full opacity; avoid fading source links into the paper. The project-label ink is `#56674e`.
- Locally hosted Nothing You Could Do carries the handwriting; Newsreader carries reading copy and project headings. DM Serif Display carries the title; IBM Plex Sans carries small utility lettering. Bundled font licenses and the colophon establish attribution.
- Project headings use 34-46px Newsreader with a 1.08 line height. Body copy uses 20px/1.5 on desktop and 18px/1.5 on phones, with a roughly 32-36-character measure. Handwriting stays in notes, labels on drawings and the guide's character.
- Preserve air for broad pen loops between chapters. Phone layouts stack copy before each scene. Do not crop or compress working illustrations to shorten the page.
- Project links have 44px hit areas, visible underlines and strong focus outlines. A hover or focus thickens the underline. Muted source links retain full opacity. Phone jump links also reserve 44px; native details and anchors work without their enhancement module.

## Continuous pen and physics

Shared geometry joins the hill, scenery, chapter floors, statistical curves and signature. The SVG hit path stays transparent. Tugs taper over 900 pixels of arc length each side with zero endpoint slope and curvature; chapter floors settle back after release. Use broad curls and continuous tangents. Data-derived curves preserve measured values.

The guide moves in world coordinates, choosing footholds, climbs, grinds, leaps and shortcuts from geometry. Botato has a scroll-released ledge hang. Throws retain momentum and gravity before winged recovery. Scene picking uses painter order and transformed bounds. Thrown helpers and props enter a shared page-wide Matter world rather than clipping at iframe edges. Recovery stays collision-free until restoration; fresh throws restore normal collisions. Closed panels discard their bodies.

Matter.js 0.20.0 supplies stylised physics. Impacts expose deeper terrain layers, unsupported ridges fail under stress, and jagged ledges detach and tumble. Reset clears bodies and constraints. Bound leg/torso reach and keep the hill actor's throw/recovery state exclusive. A stable landing foothold prevents the actor chasing a moving target. No full-screen impact flashes.

Blank canvas permits phone scrolling; dragging an actual prop captures the pointer until release or cancellation. Iframes reserve height, report actual layout and recover missed observer messages through readiness probes. Scenes play and vary while visible; hidden tabs suspend rendering and audio.

## Motion and sound

Keep motion tied to the drawings and controls. Buttons deform without replacing positioning transforms. Small annotations can wobble; reading copy remains still. Reduced motion removes decorative button, annotation and entrance effects. The explicitly activated physics playground remains available. The GitHub profile separately supplies still SVGs for reduced motion.

Guide speech uses the full phrase as an invisible size reference while typing, so its box stays steady. Captions clamp to the visual viewport and avoid the title, play controls, project copy, invitation, jump control and hill actors. Phone speech waits briefly if there is no nearby clear patch; never move the guide's physical position to solve a text collision. The hill meowl's thought has close above-head and below-foot candidates. Reduced motion also removes its text bounce and breathing offset.

Three entrance pushes unlock sound. Main music stays quiet; project panels crossfade to their original synth themes and return to the main track on close. Music and effects have separate sliders. Scene audio follows viewport proximity and stops offscreen. Mechanical keys credit MattRuthSound under CC BY 4.0; the kitten phrases are licensed recording edits. Mouth envelopes remain independent.

## Review and limits

Acceptance is fixed before review: working loader/controls; every scene ready and advancing; continuous line joins; readable desktop and 320/390px phone layouts; native phone jump navigation; keyboard focus; reduced motion; public links; no browser errors. Review in three bounded passes: functionality, design-system adherence, then rendered craft. Screenshots under `output/portfolio-review/` are local evidence and are not publication assets by default.

`docs/reference-notes.md` preserves earlier inspected references and their limits. The requested Fable URL returned HTTP 429, including in a headless attempt; it is not an inspected visual reference. This revision keeps the existing hillside identity and applies deliberate, small interactions rather than importing an unverified reference.

Automated audio diagnostics establish routing and slider state, not a listening test. A static profile preview checks artwork/layout selection locally; the final GitHub rendering requires a publication check. Long phone length remains intentional because every scene keeps its playable space; the jump list supplies a direct route through it.
