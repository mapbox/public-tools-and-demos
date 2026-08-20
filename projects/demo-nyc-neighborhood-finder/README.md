# NYC Neighborhood Finder

An AI-powered neighborhood recommendation app for New York City. Describe what you're looking for — lifestyle, commute preferences, amenities, vibe — and the app recommends specific NYC neighborhoods, highlighted on an interactive Mapbox map.

## How it works

The app uses a conversational AI agent (Claude) that combines two sources of knowledge:
- **LLM reasoning** for general neighborhood character, culture, and vibe
- **Mapbox MCP tools** for real, verifiable location data (nearby stores, transit, POIs)

The agent uses a `show_neighborhoods` tool to display recommendations as highlighted polygons on the map, with cards in the chat UI.

## Architecture

- **Frontend**: React + TypeScript + Vite + Mapbox GL JS
- **Backend**: Express server (`server.js`) that streams responses from Claude via the [Vercel AI SDK](https://sdk.vercel.ai/)
- **AI**: Anthropic Claude (claude-opus-4-6) with [Mapbox MCP Server](https://github.com/mapbox/mcp-server) tools

## Local Development

Install dependencies at the top level of the monorepo:

```
yarn
```

Create a `.env` file in this directory (copy from `.env.sample`) with your Mapbox token and Anthropic API key:

```
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Start both the frontend and backend:

```
cd projects/demo-nyc-neighborhood-finder && yarn dev
```

This runs the Vite dev server (with proxy to the backend) and the Express API server concurrently.

## Products used

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides) — interactive map with neighborhood polygon highlighting
- [Mapbox MCP Server](https://github.com/mapbox/mcp-server) — gives the AI agent access to real Mapbox location data
- [Anthropic Claude](https://www.anthropic.com/) — conversational AI for neighborhood reasoning
- [Vercel AI SDK](https://sdk.vercel.ai/) — streaming AI responses to the frontend
