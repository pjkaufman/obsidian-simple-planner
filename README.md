# Simple Planner

A plugin designed to be a simple and work on checklist items in a file with recurring events.

## How it Works

There are a list of calendars and events that exist. Each event must be attached to at least 1 calendar.

The plugin exposes several methods that can be used via Templater or elsewhere to get events for a specific day or date range.

``` TypeScript
// gets the formatted section for the specified calendars for the day provided
getEventsForDay(date: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string

// gets the weekly, monthly, and yearly events for the calendars specified for the date range specified.
getWeeklyMonthlyYearlyEventsForRange(startDate: string | undefined, endDate: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string[] | string[][]
```

These functions help determine which events are on which days which can then be responded to accordingly.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.
