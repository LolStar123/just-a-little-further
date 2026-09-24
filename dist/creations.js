// Project copy describes the work. Demo inputs are labelled in each runnable example.
export const trail=["scraper", "poe", "tfl", "commute", "smoothtato", "deadlock", "baxter", "botato", "halo", "liquidation"];
export const projects={
  "ocr": {
  "title": "poe / OCR crafting prototype",
  "short": "OCR rolls",
  "category": "path of exile / screen reading",
  "caption": "Reads tooltips and stops on target modifiers.",
  "description": "Capture a tooltip region, convert it to monochrome, run Tesseract, normalise confusable letters and compare candidate modifiers. The original Python prototype used exact and fuzzy matching with a stop event. This small example runs the text-matching stage on sample OCR output.",
  "scene": "ocr",
  "links": [
    {
      "label": "try the matching example",
      "url": "demo.html?scene=ocr"
    },
    {
      "label": "github",
      "url": "https://github.com/LolStar123/meowl-corner/blob/main/examples/ocr_match.py"
    }
  ]
},
  "scraper": {
    "title": "quant research & backtesting",
    "short": "quant research",
    "category": "FINANCE / RESEARCH",
    "caption": "automates academic research scraping and forward-testing market ideas in python.",
    "description": "Collect papers with their sources, remove duplicates and turn research ideas into Python market tests. Lag signals, deduct trading costs and use walk-forward windows to check performance on unseen periods.",
    "scene": "scraper",
    "note": "",
    "detail": "Search 320 papers, collect live Crossref results, then explore walk-forward tests on 5,351 SPY observations and 50 archived strategy results.",
    "github": "https://github.com/LolStar123/quant-research-scraper",
    "demo": "https://lolstar123.github.io/quant-research-scraper/",
    "url": "https://github.com/LolStar123/quant-research-scraper",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/quant-research-scraper/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/quant-research-scraper"
      }
    ],
    "demoDescription": "Search and export papers, run a walk-forward backtest and inspect the strategy archive.",
    "demoScope": "Real Crossref metadata; full papers stay with their publishers."
  },
  "poe": {
    "title": "poe economy scraper",
    "short": "poe economy scraper",
    "category": "GAME ECONOMIES / STATISTICS",
    "caption": "rotating proxy scrapes the path of exile virtual economy to log detailed profit and risk statistics. i optimise the little things.",
    "description": "Residential-proxy collection logs item prices for the wider pipeline. Variant probabilities and buy-in costs feed linked sheets for expected value, dispersion and profit factor. Missing prices stay visible instead of becoming invented bargains.",
    "scene": "poe",
    "note": "",
    "detail": "A game got me into statistics. The cheapest listing is not always a usable price. Search 3,741 priced Watcher's Eye pairs, model 105,995 three-mod combinations and compare eight item datasets.",
    "github": "https://github.com/LolStar123/poe-item-pricer",
    "demo": "https://lolstar123.github.io/poe-item-pricer/",
    "url": "https://github.com/LolStar123/poe-item-pricer",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/poe-item-pricer/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/poe-item-pricer"
      }
    ],
    "demoDescription": "Search 3,741 priced Watcher's Eye pairs, model 105,995 three-mod combinations and compare eight item datasets.",
    "demoScope": "August 2026 asking-price archive. Three-mod values are modelled; probability assumptions and missing coverage stay visible."
  },
  "tfl": {
    "title": "tube reliability leaderboard",
    "short": "Tube ratings",
    "category": "DATA / LONDON",
    "caption": "ranks tube lines using live rating history, like chess elo",
    "description": "Built with Benjamin Toze at QuantiHack 2026. Collect timestamped TfL arrival predictions, identify sampled stop outcomes and update bounded line ratings. Compare the live history with the original hackathon archive.",
    "scene": "tfl",
    "note": "",
    "url": "https://github.com/LolStar123/tfl-reliability",
    "link": "github",
    "detail": "A leaderboard backed by the service history, rather than one bad commute. Follow all 11 Tube ratings on a live history chart, compare the leaderboard and inspect the original QuantiHack archive.",
    "github": "https://github.com/LolStar123/tfl-reliability",
    "demo": "https://lolstar123.github.io/tfl-reliability/",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/tfl-reliability/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/tfl-reliability"
      }
    ],
    "demoDescription": "Follow all 11 Tube ratings on a live history chart, compare the leaderboard and inspect the original QuantiHack archive.",
    "demoScope": "Sampled TfL arrival predictions with durable history; Elo stays between 100 and 3500. Not official punctuality statistics."
  },
  "commute": {
    "title": "commute cost optimiser",
    "short": "commute fares",
    "category": "DATA / LONDON",
    "caption": "finds the cheapest ticket for your week.",
    "description": "Enter your journey and working pattern, then compare ticket costs with daily and weekly caps. The full calculator also handles zones, peak times, Railcards, annual leave and break-even points.",
    "scene": "commute",
    "note": "",
    "detail": "Working from home changes which ticket is worth buying. Choose from the full station database and compare PAYG, caps, Travelcards and working patterns.",
    "github": "https://github.com/LolStar123/london-commute-calculator",
    "demo": "https://lolstar123.github.io/london-commute-calculator/",
    "url": "https://github.com/LolStar123/london-commute-calculator",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/london-commute-calculator/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/london-commute-calculator"
      }
    ],
    "demoDescription": "Choose from the full station database and compare PAYG, caps, Travelcards and working patterns.",
    "demoScope": "Original complete calculator with March 2026 fare tables; dated fare basis is visible."
  },
  "smoothtato": {
    "title": "smoothtato",
    "short": "Smoothtato",
    "category": "PATH OF EXILE / PERFORMANCE",
    "caption": "my pc sucked so i made a graphics changer app to boost performance and customise visuals in path of exile.",
    "description": "Choose which graphics to remove, match cosmetic effects to your skills, and save the combined setup as a reusable preset. Restore the original files when you want to switch back.",
    "scene": "smoothtato",
    "note": "",
    "url": "https://github.com/LolStar123/smoothtato-preview",
    "link": "github",
    "detail": "Fewer particles competing with the thing about to kill you. Edit 68 real visual categories across five presets and export a desktop-compatible STATO1 configuration.",
    "github": "https://github.com/LolStar123/smoothtato-preview",
    "demo": "https://lolstar123.github.io/smoothtato-preview/",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/smoothtato-preview/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/smoothtato-preview"
      }
    ],
    "demoDescription": "Edit 68 real visual categories across five presets and export a desktop-compatible STATO1 configuration.",
    "demoScope": "Actual app settings and share-code format. The browser does not patch game files."
  },
  "deadlock": {
    "title": "deadlock statistical analysis",
    "short": "Deadlock analysis",
    "category": "GAMES / STATISTICS",
    "caption": "top 100 deadlock player. optimised my gameplay using conditional probability analyses to maximise winrate.",
    "description": "Collect match data, take comparable checkpoints and split matches by a condition. Compare win rates for economy, damage, objectives and other stats, with sample sizes and uncertainty beside each result.",
    "scene": "deadlock",
    "note": "",
    "detail": "The urn was one question. The bigger question was what actually matters. Explore 11,423 matches, compare conditional outcomes and inspect uncertainty and individual observations.",
    "github": "https://github.com/LolStar123/deadlock-match-analysis",
    "demo": "https://lolstar123.github.io/deadlock-match-analysis/",
    "url": "https://github.com/LolStar123/deadlock-match-analysis",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/deadlock-match-analysis/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/deadlock-match-analysis"
      }
    ],
    "demoDescription": "Explore 11,423 matches, compare conditional outcomes and inspect uncertainty and individual observations.",
    "demoScope": "Historical match data; associations and end-state measurements are labelled, not presented as causal forecasts."
  },
  "baxter": {
    "title": "baxter",
    "short": "Baxter",
    "category": "AI / PERSONAL ASSISTANT",
    "caption": "i love discord so i turned it into an llm harness. the bots scope, schedule, execute and verify.",
    "description": "I wired Claude into a Discord bot so I can hand off work where I already spend my time. Baxter scopes the request, schedules tasks and reserves the files they need. Work with conflicting edits waits its turn. A separate verification step checks the result before Baxter marks it done.",
    "scene": "baxter",
    "note": "",
    "url": "https://github.com/LolStar123/baxter",
    "link": "github",
    "detail": "A worker saying finished is not the same as proof. Run ten real jobs, inspect generated reports and watch independent verification stop a broken workflow.",
    "github": "https://github.com/LolStar123/baxter",
    "demo": "https://lolstar123.github.io/baxter/",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/baxter/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/baxter"
      }
    ],
    "demoDescription": "Run ten real jobs, inspect generated reports and watch independent verification stop a broken workflow.",
    "demoScope": "Deterministic browser workers over synthetic data; original orchestration source is included. No live inbox or paid agent calls."
  },
  "botato": {
    "title": "botato",
    "short": "Botato",
    "category": "PATH OF EXILE / AUTOMATION",
    "caption": "path of exile route optimisation and combat automation. end-to-end in one app.",
    "description": "Read the current terrain and target, choose a traversable route and advance along it. If an obstacle changes the route, recalculate before moving; navigation feeds the wider automation loop.",
    "scene": "botato",
    "note": "",
    "detail": "Getting somewhere is easy until the straight line goes through a wall. Navigate three terrains, draw obstacles and inspect collision-checked replanning in motion.",
    "github": "https://github.com/LolStar123/botato-navigation",
    "demo": "https://lolstar123.github.io/botato-navigation/",
    "url": "https://github.com/LolStar123/botato-navigation",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/botato-navigation/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/botato-navigation"
      }
    ],
    "demoDescription": "Navigate three terrains, draw obstacles and inspect collision-checked replanning in motion.",
    "demoScope": "Standalone terrain sandbox with original C# routing references. No game process or account access."
  },
  "halo": {
    "title": "halo",
    "short": "HALO",
    "category": "AI / MEETING ASSISTANT",
    "caption": "ai powered meeting assistant. uses personal context to provide contextualised answers.",
    "description": "Transcribe the question, combine it with selected context and prepare a response. The overlay breaks that response into readable sentences so the next useful point stays in view.",
    "scene": "halo",
    "note": "",
    "url": "https://github.com/LolStar123/halo",
    "link": "github",
    "detail": "Keep the thread when your brain briefly leaves the meeting. Load meeting notes, find matching evidence and read or edit one sentence at a time.",
    "github": "https://github.com/LolStar123/halo",
    "demo": "https://lolstar123.github.io/halo/",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/halo/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/halo"
      }
    ],
    "demoDescription": "Load meeting notes, find matching evidence and read or edit one sentence at a time.",
    "demoScope": "Local text retrieval and four fictional packs. The full desktop AI application uses your own authenticated backend."
  },
  "liquidation": {
    "title": "the hardware hunt",
    "short": "hardware hunt",
    "category": "LIQUIDATION / HARDWARE",
    "caption": "weighs up fees, taxes and margin to optimise auction flipping.",
    "description": "Track the lot, identify the hardware and estimate recoverable resale value. Include faults, buyer fees, VAT, transport and selling costs before setting a maximum hammer bid.",
    "scene": "liquidation",
    "note": "",
    "detail": "A cheap GPU stops being cheap surprisingly quickly. Browse 770 actual auction lots and build a bid sheet with editable fees, fault risk and resale assumptions.",
    "github": "https://github.com/LolStar123/hardware-hunt",
    "demo": "https://lolstar123.github.io/hardware-hunt/",
    "url": "https://github.com/LolStar123/hardware-hunt",
    "link": "github",
    "links": [
      {
        "label": "demo",
        "url": "https://lolstar123.github.io/hardware-hunt/"
      },
      {
        "label": "github",
        "url": "https://github.com/LolStar123/hardware-hunt"
      }
    ],
    "demoDescription": "Browse 770 actual auction lots and build a bid sheet with editable fees, fault risk and resale assumptions.",
    "demoScope": "Historical public lot observations; illustrative resale inputs and private bid limits excluded."
  }
};
