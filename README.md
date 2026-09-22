# my corner of the internet

A little meowl pushing a boulder, and twelve things I have been tinkering with.

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
| [dist/index.html](dist/index.html) | The page and twelve project chapters |
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
