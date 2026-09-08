import 'dotenv/config'
import express from 'express'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, jsonSchema, tool, dynamicTool, convertToModelMessages, stepCountIs } from 'ai'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { z } from 'zod'

const app = express()
app.use(express.json({ limit: '4mb' }))

// --- Mapbox MCP setup ---

const mcpClient = new Client({ name: 'nyc-neighborhood-finder', version: '1.0.0' })

await mcpClient.connect(new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@mapbox/mcp-server'],
  env: { ...process.env, MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_TOKEN ?? process.env.VITE_MAPBOX_TOKEN },
}))

const serverVersion = mcpClient.getServerVersion()
console.log(`[MCP] Server: ${serverVersion?.name} v${serverVersion?.version}`)

const { tools: mcpToolList } = await mcpClient.listTools()
console.log(`[MCP] Tools: ${mcpToolList.map(t => t.name).join(', ')}`)

// Convert MCP tools to AI SDK format (dynamicTool so they appear in the UI stream)
const mapboxTools = Object.fromEntries(
  mcpToolList.map(t => [
    t.name,
    dynamicTool({
      description: t.description ?? '',
      parameters: jsonSchema(t.inputSchema),
      execute: async (args) => {
        const result = await mcpClient.callTool({ name: t.name, arguments: args })
        return result.content.map(c => c.type === 'text' ? c.text : JSON.stringify(c)).join('\n')
      },
    }),
  ])
)

// --- System prompt and tools ---

const SYSTEM_PROMPT = `You are a knowledgeable and friendly NYC neighborhood guide. Your job is to help users find NYC neighborhoods that match their lifestyle, vibe, and requirements.

You have deep knowledge of all five boroughs — Manhattan, Brooklyn, Queens, the Bronx, and Staten Island — including their neighborhoods' characters, amenities, demographics, price ranges, transit access, dining scenes, nightlife, parks, and general atmosphere.

When a user asks about specific amenities (grocery stores, gyms, cafes, parks, transit stations, etc.), use the Mapbox tools to look up real locations before making claims. search_and_geocode_tool is good for specific brands (e.g. "Whole Foods"), category_search_tool for generic types (e.g. "gym"). Always bias searches toward NYC using coordinates near 40.7128,-74.0060 or more specific if you know the coordinates for a neighborhood you are researching. ground_location_tool answers questions about what is near a location: neighborhood context, nearby POIs by category, and travel-time reachability and may be a good starting point for understanding a neighborhood's amenities.

When a user describes what they're looking for, respond conversationally with a brief paragraph, then ALWAYS call the show_neighborhoods tool with your specific recommendations. Use the tool even if you need more information — show your best guesses so far and ask follow-up questions in your text.

Be specific and opinionated. Use neighborhood names exactly as they appear in NYC (e.g. "West Village", "Astoria", "Park Slope", "Fordham Heights").`

const tools = {
  ...mapboxTools,
  show_neighborhoods: tool({
    description: 'Display recommended neighborhoods on the map as highlighted regions with info cards in the chat. Call this whenever you have neighborhood suggestions.',
    parameters: z.object({
      neighborhoods: z.array(z.object({
        name: z.string().describe('Exact neighborhood name as it appears in NYC'),
        borough: z.string().describe('Borough (manhattan, brooklyn, queens, bronx, staten_island)'),
        reason: z.string().describe("One or two sentences on why this neighborhood fits the user's criteria. Use the field name 'reason', not 'description', 'vibe', or any other name."),
      }).strict()),
    }),
    execute: async () => 'Neighborhoods displayed on map.',
  }),
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
    onError: (error) => console.error('[streamText error]', error),
    onStepFinish: (step) => console.log('[step]', step.finishReason, 'calls:', step.toolCalls?.map(tc => tc.toolName).join(', ') || 'none'),
  })
  result.pipeUIMessageStreamToResponse(res)
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
