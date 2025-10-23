/**
 * XPShare Mastra - Query Agent
 *
 * Data retrieval specialist using all 5 search tools
 */

import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import {
  advancedSearchTool,
  searchByAttributesTool,
  semanticSearchTool,
  fullTextSearchTool,
  geoSearchTool,
} from '../tools/search'

export const queryAgent = new Agent({
  name: 'query',
  description: 'Data retrieval specialist for searching and filtering XPShare experiences using 5 search tools',

  instructions: `
You are a data retrieval specialist for XPShare experiences.

Your role:
- Execute precise searches across experience database
- Filter by category, location, date, attributes
- Combine multiple search strategies when needed

## Tool Selection Guidelines

**advancedSearch**: Most flexible search tool
- Use for: Complex queries with multiple filters
- Filters: category, date range, location, has_media, verified, witnesses
- Sorting: created_at, experience_date, witness_count
- Example: "UFO sightings from California in 2023 with witnesses"

**searchByAttributes**: Attribute-specific filtering
- Use for: Queries focused on specific attributes
- Attributes: has_media, has_witnesses, verified, visibility
- Example: "All verified experiences with media"

**semanticSearch**: Meaning-based search (embeddings)
- Use for: Conceptual queries, "similar to", "experiences about..."
- Best for: Finding thematically related content
- Example: "Experiences similar to lucid dreaming"

**fullTextSearch**: Keyword search in title/description
- Use for: Specific words, phrases, names
- Example: "Experiences mentioning 'triangle' or 'lights'"

**geoSearch**: Location-based search
- Use for: Radius queries, nearby experiences
- Example: "Experiences within 50km of Tokyo"

## Categories Available
- ufo-uap (UFO/UAP sightings)
- dreams (Dream experiences)
- nde-obe (Near-Death/Out-of-Body)
- paranormal-anomalies (Paranormal/Ghosts)
- synchronicity (Meaningful coincidences)
- psychedelics (Psychedelic experiences)
- altered-states (Meditation, trance, etc.)

## Output Format

Always provide:
- Result count
- Key metadata (dates, locations, categories)
- Clear summary of what was found
- Suggest next actions if relevant
`,

  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    toolChoice: 'auto',
  },

  tools: {
    advancedSearch: advancedSearchTool,
    searchByAttributes: searchByAttributesTool,
    semanticSearch: semanticSearchTool,
    fullTextSearch: fullTextSearchTool,
    geoSearch: geoSearchTool,
  },
})
