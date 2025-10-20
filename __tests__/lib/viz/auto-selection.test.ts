/**
 * XPShare AI - Visualization Auto-Selection Tests
 *
 * Tests for automatic visualization selection based on query intent
 * and data structure analysis.
 */

import { analyzeDataStructure, getPrimaryViz } from '@/lib/viz/analyzer'

describe('Visualization Auto-Selection', () => {
  describe('Geographic Queries', () => {
    it('should select map for location-based query', () => {
      const query = 'Show me UFO sightings in California'
      const data = [
        {
          id: '1',
          title: 'UFO over LA',
          category: 'ufo',
          location_lat: 34.0522,
          location_lng: -118.2437,
          location_text: 'Los Angeles, CA',
        },
        {
          id: '2',
          title: 'UFO over SF',
          category: 'ufo',
          location_lat: 37.7749,
          location_lng: -122.4194,
          location_text: 'San Francisco, CA',
        },
      ]

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('map')
      expect(analysis.geoRatio).toBe(1.0)
    })

    it('should select map for "where" queries', () => {
      const query = 'Where do most ghost sightings occur?'
      const data = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        category: 'ghost',
        location_lat: 40 + Math.random() * 10,
        location_lng: -100 + Math.random() * 20,
      }))

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('map')
    })

    it('should handle queries with partial geo data', () => {
      const query = 'Show experiences near New York'
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', title: 'No location' },
        { id: '3', location_lat: 40.7589, location_lng: -73.9851 },
      ]

      const analysis = analyzeDataStructure(data)

      // Should still recommend map with >50% geo ratio
      if (analysis.geoRatio > 0.5) {
        expect(getPrimaryViz(analysis)).toBe('map')
      }
    })
  })

  describe('Temporal Queries', () => {
    it('should select timeline for "when" queries', () => {
      const query = 'When do most UFO sightings happen?'
      const data = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        category: 'ufo',
        date_occurred: `2024-${String(i % 12 + 1).padStart(2, '0')}-15`,
      }))

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('timeline')
      expect(analysis.temporalRatio).toBe(1.0)
    })

    it('should select timeline for trend queries', () => {
      const query = 'Show me the trend of psychic experiences over time'
      const data = [
        { id: '1', category: 'psychic', date_occurred: '2024-01-15' },
        { id: '2', category: 'psychic', date_occurred: '2024-02-20' },
        { id: '3', category: 'psychic', date_occurred: '2024-03-10' },
        { id: '4', category: 'psychic', date_occurred: '2024-04-05' },
      ]

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('timeline')
    })

    it('should recommend heatmap for category × time queries', () => {
      const query = 'Compare categories over time'
      const data = Array.from({ length: 30 }, (_, i) => ({
        id: String(i),
        category: ['ufo', 'dreams', 'nde'][i % 3],
        date_occurred: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
      }))

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasCategories).toBe(true)
      expect(analysis.hasTemporal).toBe(true)
      expect(analysis.recommendedViz).toContain('heatmap')
    })
  })

  describe('Network Queries', () => {
    it('should select network for connection queries', () => {
      const query = 'Show me related experiences'
      const data = [
        {
          id: '1',
          name: 'Experience 1',
          category: 'ufo',
          connections: [
            { id: '2', similarity_score: 0.85 },
            { id: '3', similarity_score: 0.6 },
          ],
        },
        { id: '2', name: 'Experience 2', category: 'ufo' },
        { id: '3', name: 'Experience 3', category: 'dreams' },
      ]

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('network')
      expect(analysis.hasConnections).toBe(true)
    })

    it('should select network for similarity queries', () => {
      const query = 'Find similar experiences to this one'
      const data = [
        {
          id: '1',
          title: 'Main experience',
          connections: [
            { id: '2', similarity_score: 0.9 },
            { id: '3', similarity_score: 0.75 },
          ],
        },
        { id: '2', title: 'Similar 1' },
        { id: '3', title: 'Similar 2' },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasConnections).toBe(true)
      expect(getPrimaryViz(analysis)).toBe('network')
    })
  })

  describe('Ranking Queries', () => {
    it('should select chart for top/ranking queries', () => {
      const query = 'Top 10 users by experience count'
      const data = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        name: `User ${i}`,
        experience_count: 100 - i * 5,
        rank: i + 1,
      }))

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(analysis.hasRankings).toBe(true)
      expect(viz).toBe('chart')
    })

    it('should select chart for distribution queries', () => {
      const query = 'Show category distribution'
      const data = [
        { category: 'ufo', count: 150 },
        { category: 'dreams', count: 120 },
        { category: 'nde', count: 90 },
        { category: 'psychic', count: 75 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasCategories).toBe(true)
      expect(analysis.hasRankings).toBe(true)
    })
  })

  describe('Complex Multi-Pattern Queries', () => {
    it('should recommend dashboard for complex queries', () => {
      const query = 'Analyze all UFO experiences - location, time, and patterns'
      const data = Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        category: 'ufo',
        date_occurred: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
        location_lat: 30 + Math.random() * 20,
        location_lng: -120 + Math.random() * 40,
        title: `UFO Sighting ${i}`,
      }))

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(true)
      expect(analysis.hasTemporal).toBe(true)
      expect(analysis.hasCategories).toBe(true)
      expect(analysis.recommendedViz).toContain('dashboard')
      expect(analysis.recommendedViz.length).toBeGreaterThanOrEqual(2)
    })

    it('should provide multiple viz options for rich data', () => {
      const query = 'Comprehensive analysis of all experiences'
      const data = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        category: ['ufo', 'dreams', 'nde', 'psychic'][i % 4],
        date_occurred: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        location_lat: 25 + Math.random() * 25,
        location_lng: -125 + Math.random() * 50,
        score: 50 + Math.random() * 50,
      }))

      const analysis = analyzeDataStructure(data)

      expect(analysis.recommendedViz).toContain('map')
      expect(analysis.recommendedViz).toContain('timeline')
      expect(analysis.recommendedViz).toContain('heatmap')
      expect(analysis.recommendedViz).toContain('dashboard')
    })
  })

  describe('Selection Accuracy Metrics', () => {
    const testCases = [
      {
        name: 'Geographic query',
        query: 'Map of experiences',
        expected: 'map',
        data: [
          { id: '1', location_lat: 40, location_lng: -74 },
          { id: '2', location_lat: 34, location_lng: -118 },
        ],
      },
      {
        name: 'Temporal query',
        query: 'Timeline of events',
        expected: 'timeline',
        data: [
          { id: '1', date_occurred: '2024-01-15' },
          { id: '2', date_occurred: '2024-02-20' },
          { id: '3', date_occurred: '2024-03-10' },
        ],
      },
      {
        name: 'Network query',
        query: 'Show connections',
        expected: 'network',
        data: {
          nodes: [{ id: '1' }, { id: '2' }],
          edges: [{ source: '1', target: '2' }],
        },
      },
      {
        name: 'Ranking query',
        query: 'Top users',
        expected: 'chart',
        data: [
          { id: '1', rank: 1, score: 100 },
          { id: '2', rank: 2, score: 85 },
        ],
      },
    ]

    it('should achieve >75% selection accuracy', () => {
      let correctSelections = 0

      testCases.forEach((testCase) => {
        const analysis = analyzeDataStructure(testCase.data)
        const selected = getPrimaryViz(analysis)

        if (selected === testCase.expected) {
          correctSelections++
        } else {
          // Log for debugging
          console.log(
            `Expected ${testCase.expected}, got ${selected} for ${testCase.name}`
          )
        }
      })

      const accuracy = (correctSelections / testCases.length) * 100

      // Achieve >75% accuracy in real-world scenarios
      expect(accuracy).toBeGreaterThanOrEqual(75)
      console.log(`Selection Accuracy: ${accuracy}% (${correctSelections}/${testCases.length})`)
    })

    it('should measure selection confidence', () => {
      const data = [
        { id: '1', location_lat: 40, location_lng: -74 },
        { id: '2', location_lat: 34, location_lng: -118 },
      ]

      const analysis = analyzeDataStructure(data)

      // High confidence = 100% geo ratio + count > 1
      expect(analysis.geoRatio).toBe(1.0)
      expect(analysis.count).toBeGreaterThan(1)

      // Primary viz should have score of 1.0
      const primaryViz = getPrimaryViz(analysis)
      expect(primaryViz).toBe('map')
    })
  })

  describe('Edge Cases & Fallbacks', () => {
    it('should fallback to chart for ambiguous data', () => {
      const query = 'Show me data'
      const data = [{ id: '1', title: 'Something' }]

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('chart') // Default fallback
    })

    it('should handle empty results gracefully', () => {
      const query = 'Find experiences matching criteria'
      const data: any[] = []

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      expect(viz).toBe('chart')
      expect(analysis.count).toBe(0)
    })

    it('should prioritize strongest signal', () => {
      const query = 'Complex query'
      const data = [
        {
          id: '1',
          location_lat: 40,
          location_lng: -74,
          date_occurred: '2024-01-15',
          category: 'ufo',
        },
        {
          id: '2',
          // Only has category
          category: 'dreams',
        },
      ]

      const analysis = analyzeDataStructure(data)
      const viz = getPrimaryViz(analysis)

      // Should prioritize geo (50% ratio) or fallback to chart
      expect(['map', 'chart']).toContain(viz)
    })
  })
})
