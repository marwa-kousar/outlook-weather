# Outlook — Weather Decision Support

A weather app that answers natural-language questions about outdoor activities. Instead of displaying raw data, it gives you a direct answer: *"Should I go for a run today?"* → **"Go for it!"** with a score and the reasoning behind it.

Built as part of the Prepr Frontend Challenge.

**Live demo:** [outlook-weather.netlify.app](https://outlook-weather.netlify.app)

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To build for production:

```bash
npm run build
```

---

## How it works

1. **Search for a location** — type a city or use your device's GPS
2. **Ask a question** — anything like *"Is this weekend good for camping?"* or *"Should I water my plants?"*
3. **Get a recommendation** — a direct answer, a score out of 10, and a breakdown of the relevant weather stats
4. **Explore the forecast** — hourly conditions and a 7-day daily view

Weather data is fetched from [Open-Meteo](https://open-meteo.com/) (no API key required). Geocoding uses Open-Meteo's geocoding API and [Nominatim](https://nominatim.org/) for reverse geocoding.

---

## Supported activities

The app detects what you're asking about and applies activity-specific scoring:

| What you ask about | Ideal conditions used |
|---|---|
| Running, hiking, walking | Cool temps (5–22°C), low wind, low humidity |
| Cycling | Moderate temps (8–24°C), low wind |
| Outdoor party, BBQ, picnic | Warm temps (16–28°C), no rain |
| Canoeing, kayaking, sailing | Warm temps (15–30°C), calm water |
| Swimming, beach | Hot temps (22–35°C) |
| Golf | Mild temps (12–26°C), low wind |
| Fishing | Moderate temps (10–24°C), calm conditions |
| Camping | Moderate temps (10–25°C), no rain |
| Sports and games | Moderate temps (8–24°C), no rain |
| Gardening | Mild temps (10–28°C), dry conditions |
| Watering plants | Dry conditions (inverted logic — rain means skip it) |

Time context is also detected: questions about *"tomorrow"* or *"this weekend"* pull from the appropriate daily forecast data.

---

## Project structure

```
src/
  screens/       # Full-page screen components
  components/    # Reusable UI (LocationPill, WeatherState)
  hooks/         # useCurrentTime
  utils/         # weather.js (API + scoring), weatherIcons.js (WMO code mapping)
  assets/        # Icons, weather illustrations, background images
  App.jsx        # Screen routing and shared state
```

---

## Design decisions

- **Conversational input** over dropdowns or checkboxes — users ask questions naturally, the app interprets intent
- **Activity-specific scoring** — each activity has its own ideal temperature range and weather sensitivities rather than a one-size-fits-all recommendation
- **Inline location change** — a pill dropdown to change location without leaving the current screen
- **No UI framework** — all layouts built in plain CSS, with separate mobile and desktop layouts per screen
- **Loading and error states** — visible spinner while weather loads, retry button on failure; no silent fallback to fake data

---

## What's unfinished / what's next

- **Hourly forecast for future days** — currently the full forecast screen shows hourly data for today only; extending it to show hourly breakdowns per day would be a natural next step
- **Saved locations** — persisting recent searches to localStorage
- **Unit toggle** — Celsius/Fahrenheit and km/h vs mph
- **Accessibility audit** — keyboard navigation and screen reader testing
- **TypeScript** — the codebase is plain JS; adding types would improve maintainability

---

## AI usage

Claude (Anthropic) was used to accelerate implementation — writing components, CSS layouts, and API integration. All product decisions were made independently: the scoring logic, the activity detection scope, the screen flow, the UX choices (inline location pill, tappable question bubble, ask bar routing), and the iterative fixes throughout the build.
