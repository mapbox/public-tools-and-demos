import 'dotenv/config'
import express from 'express'
import { anthropic } from '@ai-sdk/anthropic'
import {
  streamText,
  jsonSchema,
  tool,
  dynamicTool,
  convertToModelMessages,
  stepCountIs
} from 'ai'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { z } from 'zod'

const app = express()
app.use(express.json({ limit: '4mb' }))

// --- Mapbox MCP setup ---

const mcpClient = new Client({
  name: 'nyc-neighborhood-finder',
  version: '1.0.0'
})

await mcpClient.connect(
  new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@mapbox/mcp-server'],
    env: {
      ...process.env,
      MAPBOX_ACCESS_TOKEN:
        process.env.MAPBOX_TOKEN ?? process.env.VITE_MAPBOX_TOKEN
    }
  })
)

const serverVersion = mcpClient.getServerVersion()
console.log(`[MCP] Server: ${serverVersion?.name} v${serverVersion?.version}`)

const { tools: mcpToolList } = await mcpClient.listTools()
console.log(`[MCP] Tools: ${mcpToolList.map((t) => t.name).join(', ')}`)

// Convert MCP tools to AI SDK format (dynamicTool so they appear in the UI stream)
const mapboxTools = Object.fromEntries(
  mcpToolList.map((t) => [
    t.name,
    dynamicTool({
      description: t.description ?? '',
      parameters: jsonSchema(t.inputSchema),
      execute: async (args) => {
        const result = await mcpClient.callTool({
          name: t.name,
          arguments: args
        })
        return result.content
          .map((c) => (c.type === 'text' ? c.text : JSON.stringify(c)))
          .join('\n')
      }
    })
  ])
)

// --- System prompt and tools ---

const SYSTEM_PROMPT = `You are a knowledgeable and friendly NYC neighborhood guide. Your job is to help users find NYC neighborhoods that match their lifestyle, vibe, and requirements.

CRITICAL RULE — read this first: show_neighborhoods is the ONLY way your recommendations appear on the map and as cards in the UI. Text alone renders nothing visually there. So:
- Every time your response names one or more specific neighborhoods as a recommendation — the first message AND every follow-up, refinement, or "what about X instead" — you MUST call show_neighborhoods with the full, non-empty list.
- Keep your chat text SHORT: a sentence or two of framing or tone. Do NOT write out each neighborhood's name and reasoning in your prose — that detail belongs ONLY in the "reason" field of the show_neighborhoods call. Saying it twice wastes effort and is the main reason this tool call fails; say it once, in the tool call.
- Never call show_neighborhoods with an empty list. If you don't have enough information yet, still call it with your best guesses and ask your follow-up question in the (short) text.

You have deep knowledge of all five boroughs — Manhattan, Brooklyn, Queens, the Bronx, and Staten Island — including their neighborhoods' characters, amenities, demographics, price ranges, transit access, dining scenes, nightlife, parks, and general atmosphere.

When a user asks about specific amenities (grocery stores, gyms, cafes, parks, transit stations, etc.), use the Mapbox tools to look up real locations before making claims. search_and_geocode_tool is good for specific brands (e.g. "Whole Foods"), category_search_tool for generic types (e.g. "gym"). Always bias searches toward NYC using coordinates near 40.7128,-74.0060 or more specific if you know the coordinates for a neighborhood you are researching. ground_location_tool answers questions about what is near a location: neighborhood context, nearby POIs by category, and travel-time reachability and may be a good starting point for understanding a neighborhood's amenities.

Be specific and opinionated. Use neighborhood names exactly as they appear in NYC (e.g. "West Village", "Astoria", "Park Slope", "Fordham Heights").

Reminder: keep chat text brief, put all recommendation detail in the show_neighborhoods "reason" field, and call show_neighborhoods on every turn that contains a recommendation — including follow-ups. Never call it with an empty list.`

// Real, typed shape — kept strongly typed (not loosened to z.any()) because the
// model's tool-argument generation quality depends heavily on the JSON Schema
// it's given. `.min(1)` is intentionally left off the outer array so a technically
// well-shaped but empty call still reaches execute() and gets a corrective error
// back, instead of being hard-rejected before execute() ever runs.
const neighborhoodShape = z.object({
  name: z.string().describe('Exact neighborhood name as it appears in NYC'),
  borough: z
    .string()
    .describe('Borough (manhattan, brooklyn, queens, bronx, staten_island)'),
  reason: z
    .string()
    .describe(
      "One or two sentences on why this neighborhood fits the user's criteria. Use the field name 'reason', not 'description', 'vibe', or any other name."
    )
})

const tools = {
  ...mapboxTools,
  show_neighborhoods: tool({
    description:
      'Display recommended neighborhoods on the map as highlighted regions with info cards in the chat. This is the ONLY way recommendations become visible to the user — call it every time your response names specific neighborhoods, with the full, non-empty list.',
    parameters: z.object({
      neighborhoods: z
        .array(neighborhoodShape)
        .describe('Your recommended neighborhoods. Must not be empty.')
    }),
    execute: async (args) => {
      console.log('[show_neighborhoods] raw args:', JSON.stringify(args))

      const parsed = z
        .array(neighborhoodShape)
        .min(1)
        .safeParse(args?.neighborhoods)
      if (!parsed.success) {
        console.warn(
          '[show_neighborhoods] shape mismatch:',
          JSON.stringify(parsed.error.issues)
        )
        return 'Error: this call did not include a valid, non-empty "neighborhoods" array. Call show_neighborhoods again right now with your actual recommendations as an array of { name, borough, reason }.'
      }

      console.log(
        `[show_neighborhoods] validated ${parsed.data.length} neighborhoods:`,
        parsed.data.map((n) => n.name).join(', ')
      )
      return 'Neighborhoods displayed on map.'
    }
  })
}

// --- Chat endpoint ---

app.post('/api/chat', async (req, res) => {
  const messages = await convertToModelMessages(req.body.messages)
  const result = streamText({
    model: anthropic('claude-opus-4-6'),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    stopWhen: stepCountIs(25),
    onError: (error) => {
      console.error(
        '[streamText error]',
        error?.name ?? '',
        error?.message ?? error
      )
      if (error?.cause) console.error('[streamText error] cause:', error.cause)
    },
    onStepFinish: (step) => {
      console.log(
        '[step]',
        step.finishReason,
        'calls:',
        step.toolCalls?.map((tc) => tc.toolName).join(', ') || 'none'
      )
    }
  })
  result.pipeUIMessageStreamToResponse(res)
})

const PORT = 3001
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
)
