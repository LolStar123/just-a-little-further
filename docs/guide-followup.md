# Guide and recovery follow-up

Completed 23 September 2026. This follows the previous guide-polish review.

## Completed changes

- [x] Recovery gives both meowl and its item collision-free god mode before the physics step, throughout retrieval and the trip home. Normal physics resumes on the next throw after restoration. Stale throw coordinates are cleared.
- [x] Shortened thrown-helper ballistic time to 0.7 seconds; gravity accelerates drops, wingbeats shape recovery, and nearby helpers retrieve items more easily.
- [x] Repeated Baxter throws, paired throws, re-grabs, cancellation, scrolling, resizing and mobile throws recover without stranded bodies.
- [x] Sidebar throws remain visible above the panel; closing a panel removes its detached bodies and handles.
- [x] Guide travel is three times faster, with landing-page hops, waves, varied greetings and attached effort sweat.
- [x] Guide speech has larger type, stable body-relative placement, typewriter reveal and very quiet varied typing clicks.
- [x] Quant researcher uses a continuous route clock, including paper changes and manual changes. Sweat stays attached to its body.
- [x] Hardware keeps adding GPUs while individual GPUs are thrown and rescued; each GPU has its own identity.
- [x] Spades are black, clubs blue, hearts bright red and diamonds orange. Cards have varied tilts, flicks and drawn highlights.
- [x] Every button compresses and rebounds; pressing is no longer cancelled by focus animation. Initial mouse/touch entry does not highlight the help button.
- [x] Three distinct animated arrows highlight Poetato; all three Yoshis squish with elastic recovery and a recorded squelch. Links remain separate.
- [x] Researcher annotation arrow enlarged substantially.
- [x] Watcher's Eye apostrophe and generalist item-pricer copy corrected; Smoothtato describes carefully replacing game files.
- [x] Title changed to centred, deliberately wonky 'just a little further', with more top space.
- [x] OCR section temporarily removed from the page and navigation; its example source remains archived.
- [x] Interests reduced to 'off the clock' with cycling fading dots and distinct animated daydream doodles. Labels stay still and readable.
- [x] Removed footer 'still finding my place'.
- [x] Smaller cliff fragments detach and fall clear instead of lodging above the surface.
- [x] Quote bylines shortened to names and explicitly loose qualifiers where requested.

## Evidence

Headless browser checks used real pointer interaction on desktop and mobile. `docs/qa/baxter-edges.json` records 13 throw/cancellation/resize/scroll cases. `baxter-godmode-final.json` reruns repeated and paired throws after the final pre-step collision fix. Both finish with no active stranded bodies or browser errors. The measured maximum frame displacement in the final repeated throw test was 30.23 pixels.

`sidebar-qa.json` covers five scenes at two viewport sizes. `release-qa.json` checks the continuous researcher route across 650 animation frames and five manual paper changes, typed speech, stationary relative captions, changing interest scenes and zero horizontal overflow at 1440 and 390 pixels. `yoshi-buttons.json` checks mouse and keyboard activation and sound events. `followup-qa.json` includes continued GPU stacking and falling cliff fragments.

These are bounded interaction checks, not a proof of all possible physics states. Sound events and levels were checked programmatically; this pass did not include human listening review.

## Further requests completed in this pass

- [x] Sisyphus throws suspend autonomous hill poses and chasing. A 0.7-second ballistic arc leads into winged, collision-free recovery to a chosen foothold, followed by normal hill behaviour.
- [x] Hard approaching boulder impacts pancake meowl, including held-rock collisions. Gentle contact retains catching behaviour.
- [x] The loose line immediately below the cliff is draggable. The physical hill is anchored, with smooth tension falloff into the loose exit.
- [x] Cheer triggers the guide's large jump, landing bounce, wing waving and drawn pom-poms. It sits beside the other two primary controls; reset remains smaller on its own row.
- [x] Unloaded scenes show an original drawn stagehand hauling a line. The overlay leaves on the real ready signal, with no artificial delay. Offscreen animation pauses; reduced motion is static.
- [x] Researcher joke is smaller, crooked and offset into an aside, with a large independent arrow.

The loading treatment follows the existing reference sweep's decisions: consistent motif from the branding boards, clear staging from Detail and Kage, and restrained motion around stationary text. No third-party loader asset is copied.

## Quote provenance

Replaced both uncertain attributions with exact excerpts from Marcus Aurelius in George Long's public-domain translation: [Meditations 5.1](https://classics.mit.edu/Antoninus/meditations.5.five.html), about rising to human work, and [4.31](https://classics.mit.edu/Antoninus/meditations.4.four.html), about loving the craft one has learned. Byline: only the name. The Onion and the other two correctly credited original lines remain.

`hill-followup.json` records three real pointer throws at each viewport, the cheer state, pulled cliff-exit displacement and the three-control layout. `impact-quotes-qa.json` verifies a hard held-rock collision and all five visible quote/byline pairs. `loading-qa.json` delays the actual scraper request, verifies the loader, then releases it and checks removal with zero horizontal overflow.

## Attention pass

- [x] Higher greeting hops, wider sideways movement, alternating rebound jumps and two-wing waving. Pausing near a project also invites an attention routine; scrolling clears the queued rebound.
- [x] Cheer pom-poms are substantially larger, one bright red and one blue.
- [x] Real-browser checks at desktop and mobile observed ten greeting jumps across a 14-second watch, then successful pursuit after scrolling during a cheer. Reduced-motion mode produced no automatic jumps. Evidence: `docs/qa/attention-qa.json`.

## Tube corner and train handoff

- [x] Removed the oscillating destination and bounded lookahead at the destination. Nearby loop branches are selected with route continuity; landing uses the committed jump endpoint instead of a newly selected line segment.
- [x] Train and conductor positions use the interaction-aware movement clock. Rescue holds their home positions steady, then the normal animation resumes after both return.
- [x] All three trains thrown and returned on desktop and mobile; no stranded bodies, resumed route clock and no browser errors.
- [x] Removed researcher and all three Poetato arrows. Researcher aside uses the readable 15/16px body font; mascots, squish controls and links remain.

Six-second route watches at three scroll positions on desktop and mobile are recorded in `docs/qa/corner-routing-qa.json`. Intended attention-hop reversals remain. Train handoffs are in `docs/qa/train-recovery-qa.json`.

## Botato and type follow-up

- [x] Busy-scene detection includes thrown actors as well as props. Botato pauses its route and camera during recovery, then resumes walking. Three repeated throws pass at desktop and mobile sizes.
- [x] Off the clock uses the standard section-heading rules.
- [x] CSS text sizes increased by 6%, with illustration-label sizes increased too. Heading parity and zero horizontal overflow checked at 1440, 390 and 360 pixels.

Evidence: `docs/qa/botato-recovery-qa.json` and `docs/qa/type-qa.json`.

## Loop exit and screen-following correction

- [x] The guide has an explicit first-scene entrance checkpoint, rather than treating the arrival loop as an endless destination. Landing and movement remain continuous.
- [x] His destination follows the bottom fifth of the visual viewport, including zoom offsets and short/wide screens. Throws and deliberate jumps may briefly leave that band. Ledge hangs yield when they leave the target band.
- [x] Loading hint counts down from clicking 3 times to 2 times to 1 time.
- [x] Off-the-clock dots use an explicit 0,1,2,3,2,1 count with reserved width and a slight fade; reduced motion removes the fade, not the count.

`docs/qa/bottom-guide-qa.json` checks screen position at four scroll offsets in three viewport shapes. `docs/qa/dots-zoom-qa.json` records the actual dot sequence and a 1.5x visual-viewport zoom check. `docs/qa/loop-exit-qa.json` covers first-scene checkpoint arrivals before the subsequent viewport anchoring pass.


## 23 September: wire, opening, words
- [x] Readable loading countdown in 22px reading font.
- [x] Keep the rematch and Onion lines; remove ChatGPT entries and repeated authors. Add Camus, Seneca, Beckett and the necessity proverb. Sources in credits; rematch attribution remains unknown.
- [x] Remove viewport-clamped invisible landing surfaces. Choose real wire coordinates.
- [x] Bottom fifth is a destination preference; remove flight triggered solely by leaving that screen band.
- [x] Resting uses attention hops, waves and direct requests to scroll down.
- [x] Visible letter-by-letter chatter at 48ms per character, also when reduced motion is enabled.
- [x] Opening draws the continuous SVG stroke and progressively reveals the canvas, with staggered text and entity fades; finishes within 2.85 seconds. Reduced-motion version uses short fades.
- [x] Remove the fixed duplicate canvas cliff-exit stroke so only the deformable shared SVG owns that segment. Pointer drag verified on its upper stretch.
- [x] Shorten project links to demo and github, including panel data.

Verification: syntax checks; browser quote cycling; desktop/mobile/wide guide observation; opening screenshots; observed partial typed strings; real pointer drag displaced the upper exit by 58px horizontally and 46px vertically and released normally. Opening uses a drawing reveal for canvas artwork, not individual stroke reconstruction of raster assets.

- [x] Remove redundant manual cycle buttons from all nine rotating mini-scenes, HALO replay and hardware next-lot. Keep Botato loot movement and the main hill interactions.

## Recovered wrong-chat requests, 23 September
- [x] Recovered the actual saved clipboard image: chunky ?my fav meowlz? annotation and curled arrow beneath Baxter. Added readable bold lettering, slight wonk and restrained stepped arrow movement.
- [x] Rename Deadlock heading and panel title to ?deadlock statistical analysis?. Lead with top 100 and conditional win rates informing gameplay.
- [x] Remove Deadlock's status/colour narration and redundant compare button (button already removed in v41). Keep the statistics running.
- [x] Lower both default background and project music gains by exactly 10%, from .098 to .0882. SFX unchanged.

Copy audit: retained the user-supplied top-100 claim; no invented performance improvement. Rejected generic ?unlock insights?, ?data-driven solutions? and ?cutting-edge analysis?. Long-form prose quotas do not fit a two-sentence project caption.

- [x] Boot button escalates PUSH. / PUUUSH! / PUUUUUUSH!!! across its three presses, with mechanical key travel, shared spring release and recorded click plus quiet boing. First click waits for the audio context to resume.

- [x] Repair the mountain/wire join above the opaque hero canvas: render the same deforming exit points in a clipped overlay; no fixed duplicate curve.
- [x] Halve train recording gain from .33 to .165; music remains separately reduced by 10%.

- [x] Guide progress watchdog: after 1.8 seconds without gaining ground toward a distant perch, leap over a nearby loop or flutter to a fixed wire landing. Four-second cooldown; no position assignment/teleport.

- [x] Probability plinks and happy-outlier plinks 20% quieter; comedic blink plinks unchanged.

- [x] Off-the-clock meowl sits at a scribbled computer with alternating wing taps, stepped screen variants, a mug and pauses to wave. Keyboard clicks at .22 level, four times the guide's .055 typing level; existing visibility gating stops offscreen playback.
- [x] When the signature lettering is visible, guide targets its final flourish directly and settles into a waving goodbye pose. Leaving that area restores the normal route.

Verified at 1440px and 390px: no scene exceptions, 17 desk key events sampled per view, guide landed within 1px of signature endpoint. Inspected desktop desk and mobile goodbye screenshots.

- [x] Research-paper rustles now follow the runner clock: pickup at lap start, notebook placement at 65% of the lap. Slightly louder varied paper recordings (.8 to 1 / 1.12 scene levels).

- [x] Restore the visible papers-collected counter under the research title; increments at notebook delivery, using the continuous route clock.

## Centred stamps and hairpin traversal
- [x] Keep PUSH. / PUUUSH! / PUUUUUUSH!!! in a fixed-width centred key. Label stamps rotate -4 / +3 / -5 degrees with a brief squash and sparse impact marks; reduced motion retains static tilts.
- [x] Shorten guide look-ahead from 110px to 24px so tight bends do not aim back across themselves. Restrict branch matching to a local 130px arc and prevent backward branch jumps beyond 20px.
- [x] Detect stationary nearby junctions, not just distant stalls; hop across when necessary.
- [x] Measure stall progress using remaining distance along the wire rather than straight-line distance, which increases legitimately around a hairpin. Only settle once both physical and path distance are close.

Verification: three stamp stages measured centred within .01px on 1440px and 390px viewports; full word fits the key. Deterministic guide traversal passed 12px, 25px and 55px radius 180-degree turns.

## Vertical parkour
- [x] Near-vertical descents select a two-wing pole grip, controlled sliding motion and tucked stance instead of running in midair. Walking sounds stop during the slide.
- [x] Steep ascents select alternating wall jumps, with lateral kick velocity curving back to the real wire landing, plus a dedicated kick pose.
- [x] Verified descending and ascending routes and visually inspected four pose frames. Tight/medium/wide hairpin regressions still pass.

## Pole exit and Divine Orb
- [x] A pole descent turning into a horizontal run now plants a foot and kicks toward a real future point on the line, with seven short-lived ink dust puffs and recorded spring/contact sounds.
- [x] Botato loot is an original rough Divine Orb face drawing, also used for the offscreen marker. Existing prop identity and retrieval remain intact. Icon reference: https://www.poewiki.net/wiki/Divine_Orb ; visual reference inspected via https://buyboost.com/data/products/2464/divine-orb-preview.webp (reference only, no downloaded artwork shipped).
