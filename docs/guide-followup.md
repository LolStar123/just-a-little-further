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
