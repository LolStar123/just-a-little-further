// Project copy describes the work. Demo inputs are labelled in each runnable example.
export const trail=["scraper", "pipeline", "poe", "tfl", "commute", "smoothtato", "mtxtato", "deadlock", "baxter", "botato", "halo", "liquidation"];
export const projects={
  "scraper": {
    "title": "quant finance research scraper",
    "short": "quant scraper",
    "category": "FINANCE / RESEARCH",
    "caption": "Collects papers, removes duplicates and keeps the source beside each research idea.",
    "description": "Search for a topic, collect paper metadata, then deduplicate by DOI or title. The reading list keeps titles, dates and source links together so an interesting idea can become a testable strategy.",
    "scene": "scraper",
    "note": "",
    "detail": "Less time reopening the same papers. More time checking the idea. Search 320 real papers, collect live Crossref results and export a saved reading list.",
    "github": "https://github.com/LolStar123/quant-research-scraper",
    "demo": "https://lolstar123.github.io/quant-research-scraper/",
    "url": "https://github.com/LolStar123/quant-research-scraper",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/quant-research-scraper/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/quant-research-scraper"
      }
    ],
    "demoDescription": "Search 320 real papers, collect live Crossref results and export a saved reading list.",
    "demoScope": "Real Crossref metadata; full papers stay with their publishers."
  },
  "pipeline": {
    "title": "market backtesting pipeline",
    "short": "market backtests",
    "category": "DATA / RESEARCH",
    "caption": "Tests trading ideas on unseen periods, after costs, to separate signal from noise.",
    "description": "Clean the price history, lag the trading signal, deduct execution costs and test on later periods. Walk-forward checks show whether a rule survives beyond the data used to choose it.",
    "scene": "pipeline",
    "note": "",
    "url": "https://github.com/LolStar123/markets-backtesting",
    "link": "github / code",
    "detail": "An attractive backtest has to survive the next window. Run a walk-forward strategy on 5,351 SPY observations and inspect 50 archived research results.",
    "github": "https://github.com/LolStar123/markets-backtesting",
    "demo": "https://lolstar123.github.io/markets-backtesting/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/markets-backtesting/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/markets-backtesting"
      }
    ],
    "demoDescription": "Run a walk-forward strategy on 5,351 SPY observations and inspect 50 archived research results.",
    "demoScope": "Actual historical data; costs and training choices are editable. Historical results do not promise future returns."
  },
  "poe": {
    "title": "poe item pricer",
    "short": "PoE statistics",
    "category": "GAME ECONOMIES / STATISTICS",
    "caption": "Turns item variants and market observations into expected-value and risk sheets.",
    "description": "Residential-proxy collection logs item prices for the wider pipeline. Variant probabilities and buy-in costs feed linked sheets for expected value, dispersion and profit factor. Missing prices stay visible instead of becoming invented bargains.",
    "scene": "poe",
    "note": "",
    "detail": "A game got me into statistics. The cheapest listing is not always a usable price. Inspect three original spreadsheets, recalculate 114 historical outcomes and browse 3,741 modifier pairs.",
    "github": "https://github.com/LolStar123/poe-item-pricer",
    "demo": "https://lolstar123.github.io/poe-item-pricer/",
    "url": "https://github.com/LolStar123/poe-item-pricer",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/poe-item-pricer/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/poe-item-pricer"
      }
    ],
    "demoDescription": "Inspect three original spreadsheets, recalculate 114 historical outcomes and browse 3,741 modifier pairs.",
    "demoScope": "Original workbook assumptions and real modifier catalogue. No live trade or proxy connection."
  },
  "tfl": {
    "title": "tube reliability",
    "short": "Tube ratings",
    "category": "DATA / LONDON",
    "caption": "Ranks all eleven Tube lines from sampled arrival evidence, with a live rating history.",
    "description": "Built with Benjamin Toze at QuantiHack 2026. Collect timestamped TfL arrival predictions, identify sampled stop outcomes and update bounded line ratings. Compare the live history with the original hackathon archive.",
    "scene": "tfl",
    "note": "",
    "url": "https://github.com/LolStar123/tfl-reliability",
    "link": "github / code",
    "detail": "A leaderboard backed by the service history, rather than one bad commute. Follow all 11 Tube ratings on a live history chart, compare the leaderboard and inspect the original QuantiHack archive.",
    "github": "https://github.com/LolStar123/tfl-reliability",
    "demo": "https://lolstar123.github.io/tfl-reliability/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/tfl-reliability/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/tfl-reliability"
      }
    ],
    "demoDescription": "Follow all 11 Tube ratings on a live history chart, compare the leaderboard and inspect the original QuantiHack archive.",
    "demoScope": "Sampled TfL arrival predictions with durable history; Elo stays between 100 and 3500. Not official punctuality statistics."
  },
  "commute": {
    "title": "commute calculator",
    "short": "commute fares",
    "category": "DATA / LONDON",
    "caption": "Compares pay-as-you-go, fare caps and Travelcards for the week you actually travel.",
    "description": "Enter your journey and working pattern, then compare ticket costs with daily and weekly caps. The full calculator also handles zones, peak times, Railcards, annual leave and break-even points.",
    "scene": "commute",
    "note": "",
    "detail": "Working from home changes which ticket is worth buying. Choose from the full station database and compare PAYG, caps, Travelcards and working patterns.",
    "github": "https://github.com/LolStar123/london-commute-calculator",
    "demo": "https://lolstar123.github.io/london-commute-calculator/",
    "url": "https://github.com/LolStar123/london-commute-calculator",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/london-commute-calculator/"
      },
      {
        "label": "github / code",
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
    "caption": "Cuts Path of Exile's visual clutter with presets that keep combat cues readable.",
    "description": "Choose a preset, inspect which effect categories it removes and keep the important encounter cues. Saved configurations make the changes repeatable; restoring Original brings the visuals back.",
    "scene": "smoothtato",
    "note": "",
    "url": "https://github.com/LolStar123/smoothtato-preview",
    "link": "github / code",
    "detail": "Fewer particles competing with the thing about to kill you. Edit 68 real visual categories across five presets and export a desktop-compatible STATO1 configuration.",
    "github": "https://github.com/LolStar123/smoothtato-preview",
    "demo": "https://lolstar123.github.io/smoothtato-preview/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/smoothtato-preview/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/smoothtato-preview"
      }
    ],
    "demoDescription": "Edit 68 real visual categories across five presets and export a desktop-compatible STATO1 configuration.",
    "demoScope": "Actual app settings and share-code format. The browser does not patch game files."
  },
  "mtxtato": {
    "title": "mtxtato",
    "short": "MTXtato",
    "category": "PATH OF EXILE / COSMETICS",
    "caption": "Matches skills with compatible cosmetic effects and keeps the swaps organised.",
    "description": "Browse the effect catalogue, match an effect to its base skill and build the asset replacement plan. Compatibility checks keep a cosmetic selection tied to the skill it belongs to.",
    "scene": "mtxtato",
    "note": "",
    "url": "https://github.com/LolStar123/mtxtato-catalogue",
    "link": "github / code",
    "detail": "Same skill. A completely different wardrobe. Browse 1,489 skill effects with real previews, build a loadout and export its app configuration.",
    "github": "https://github.com/LolStar123/mtxtato-catalogue",
    "demo": "https://lolstar123.github.io/mtxtato-catalogue/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/mtxtato-catalogue/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/mtxtato-catalogue"
      }
    ],
    "demoDescription": "Browse 1,489 skill effects with real previews, build a loadout and export its app configuration.",
    "demoScope": "Actual catalogue, mapping confidence and asset paths. No game-file patching in the browser."
  },
  "deadlock": {
    "title": "deadlock match analysis",
    "short": "Deadlock analysis",
    "category": "GAMES / STATISTICS",
    "caption": "Compares match conditions to find which stats are most associated with winning.",
    "description": "Collect match data, take comparable checkpoints and split matches by a condition. Compare win rates for economy, damage, objectives and other stats, with sample sizes and uncertainty beside each result.",
    "scene": "deadlock",
    "note": "",
    "detail": "The urn was one question. The bigger question was what actually matters. Explore 11,423 matches, compare conditional outcomes and inspect uncertainty and individual observations.",
    "github": "https://github.com/LolStar123/deadlock-match-analysis",
    "demo": "https://lolstar123.github.io/deadlock-match-analysis/",
    "url": "https://github.com/LolStar123/deadlock-match-analysis",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/deadlock-match-analysis/"
      },
      {
        "label": "github / code",
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
    "caption": "Turns incoming requests into scoped tasks, schedules the work and checks completion.",
    "description": "Triage the request, define a task and reserve the files it needs. Work with conflicting edits waits its turn. A separate verification step checks the result before Baxter marks it done.",
    "scene": "baxter",
    "note": "",
    "url": "https://github.com/LolStar123/baxter",
    "link": "github / code",
    "detail": "A worker saying finished is not the same as proof. Run ten real jobs, inspect generated reports and watch independent verification stop a broken workflow.",
    "github": "https://github.com/LolStar123/baxter",
    "demo": "https://lolstar123.github.io/baxter/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/baxter/"
      },
      {
        "label": "github / code",
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
    "caption": "Plans routes around obstacles and handles the repetitive movement and combat loops.",
    "description": "Read the current terrain and target, choose a traversable route and advance along it. If an obstacle changes the route, recalculate before moving; navigation feeds the wider automation loop.",
    "scene": "botato",
    "note": "",
    "detail": "Getting somewhere is easy until the straight line goes through a wall. Navigate three terrains, draw obstacles and inspect collision-checked replanning in motion.",
    "github": "https://github.com/LolStar123/botato-navigation",
    "demo": "https://lolstar123.github.io/botato-navigation/",
    "url": "https://github.com/LolStar123/botato-navigation",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/botato-navigation/"
      },
      {
        "label": "github / code",
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
    "caption": "A meeting assistant that brings spoken questions, screen context and reference notes into one reading overlay.",
    "description": "Transcribe the question, combine it with selected context and prepare a response. The overlay breaks that response into readable sentences so the next useful point stays in view.",
    "scene": "halo",
    "note": "",
    "url": "https://github.com/LolStar123/halo",
    "link": "github / code",
    "detail": "Keep the thread when your brain briefly leaves the meeting. Load meeting notes, find matching evidence and read or edit one sentence at a time.",
    "github": "https://github.com/LolStar123/halo",
    "demo": "https://lolstar123.github.io/halo/",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/halo/"
      },
      {
        "label": "github / code",
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
    "caption": "Turns auction lots into fee-adjusted buying limits, using condition and resale evidence.",
    "description": "Track the lot, identify the hardware and estimate recoverable resale value. Include faults, buyer fees, VAT, transport and selling costs before setting a maximum hammer bid.",
    "scene": "liquidation",
    "note": "",
    "detail": "A cheap GPU stops being cheap surprisingly quickly. Browse 770 actual auction lots and build a bid sheet with editable fees, fault risk and resale assumptions.",
    "github": "https://github.com/LolStar123/hardware-hunt",
    "demo": "https://lolstar123.github.io/hardware-hunt/",
    "url": "https://github.com/LolStar123/hardware-hunt",
    "link": "github / code",
    "links": [
      {
        "label": "try the working demo",
        "url": "https://lolstar123.github.io/hardware-hunt/"
      },
      {
        "label": "github / code",
        "url": "https://github.com/LolStar123/hardware-hunt"
      }
    ],
    "demoDescription": "Browse 770 actual auction lots and build a bid sheet with editable fees, fault risk and resale assumptions.",
    "demoScope": "Historical public lot observations; illustrative resale inputs and private bid limits excluded."
  }
};
