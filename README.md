# my corner of the internet

A little meowl pushing a boulder, and thirteen things I have been tinkering with, plus the other constants in my brain.

**[Visit the website](https://atul-kanodia-fieldnotes.atulswaggalicious.chatgpt.site)** · [All project repositories and demos](https://github.com/LolStar123)

![The meowl hillside and project trail](docs/preview.png)

## Run locally

```sh
npm ci
npm run check
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. The checked-in static build works without a backend.
After editing an embedded project scene, run `npm run build:demos`.

## Find your way around

| Source | Responsibility |
| --- | --- |
| [dist/index.html](dist/index.html) | The page, thirteen projects and the interests matrix |
| [dist/creations.js](dist/creations.js) | Project descriptions, GitHub links and working demos |
| [dist/hill-physics.js](dist/hill-physics.js) | Boulder, terrain erosion and the meowl's movement |
| [dist/little-creatures.js](dist/little-creatures.js) | Shared drawn characters and poses |
| [dist/pen-thread.js](dist/pen-thread.js) | The connected line through the page |
| [dist/mini-scenes.js](dist/mini-scenes.js) | Project scenes |
| [dist/soundscape.js](dist/soundscape.js) | Screen-aware sound and volume controls |
| [dist/credits.html](dist/credits.html) | Asset sources and attribution |

This repository contains the public website source, without local research notes,
hosting credentials or personal workspace history. Third-party artwork, sound and
fonts retain their respective rights; see the credits and bundled license files.

## Small experiments

- [OCR matching](examples/ocr_match.py): run `python examples/ocr_match.py`. Normalises confusable characters and checks exact/fuzzy modifier matches without screen capture or input automation.
- [Personal scenes](dist/personal-scenes.js): sample OCR output and an automatically revealed interests matrix with a calculated inverse.
- [Interaction system](dist/toy-interactions.js): grab, throw, cancel and recover helpers and props in responsive canvas coordinates.
- [Guiding line](dist/thread-life.js): springy tugs and the little guide's path along the page.
- [Design rules](DESIGN.md) and [reference decisions](docs/reference-notes.md).

Enter with three pushes to unlock audio. The examples run automatically while visible. Main music and effects have separate sliders. Project-panel themes are original quiet synth arrangements. The website remains a stylised playground; illustrative scene data is labelled separately from the linked working research demos.
