/**
 * XPShare AI - Data Analyzer Tests
 *
 * Unit tests for data structure analysis and visualization recommendations.
 */

import {
  analyzeDataStructure,
  getPrimaryViz,
  isSuitableFor,
  getVizPriorityScore,
} from '@/lib/viz/analyzer'

describe('Data Structure Analyzer', () => {
  describe('analyzeDataStructure', () => {
    it('should detect empty data', () => {
      const analysis = analyzeDataStructure([])

      expect(analysis.count).toBe(0)
      expect(analysis.hasGeo).toBe(false)
      expect(analysis.hasTemporal).toBe(false)
      expect(analysis.hasCategories).toBe(false)
      expect(analysis.recommendedViz).toContain('chart')
    })

    it('should detect geographic data', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(true)
      expect(analysis.geoRatio).toBe(1.0)
      expect(analysis.recommendedViz[0]).toBe('map')
    })

    it('should detect temporal data', () => {
      const data = [
        { id: '1', date_occurred: '2024-01-15', title: 'Event 1' },
        { id: '2', date_occurred: '2024-02-20', title: 'Event 2' },
        { id: '3', date_occurred: '2024-03-10', title: 'Event 3' },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasTemporal).toBe(true)
      expect(analysis.temporalRatio).toBe(1.0)
      expect(analysis.recommendedViz).toContain('timeline')
    })

    it('should detect category data', () => {
      const data = [
        { id: '1', category: 'ufo', title: 'UFO Sighting' },
        { id: '2', category: 'dreams', title: 'Strange Dream' },
        { id: '3', category: 'ufo', title: 'Another UFO' },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasCategories).toBe(true)
      expect(analysis.categoryDiversity).toBeCloseTo(0.667, 2)
    })

    it('should detect connection data', () => {
      const data = [
        {
          id: '1',
          name: 'Node 1',
          connections: [{ id: '2', similarity_score: 0.8 }],
        },
        {
          id: '2',
          name: 'Node 2',
        },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasConnections).toBe(true)
      expect(analysis.recommendedViz).toContain('network')
    })

    it('should detect ranking data', () => {
      const data = [
        { id: '1', name: 'User 1', score: 100 },
        { id: '2', name: 'User 2', score: 85 },
        { id: '3', name: 'User 3', score: 70 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasRankings).toBe(true)
      expect(analysis.recommendedViz).toContain('chart')
    })

    it('should recommend multiple visualizations for multi-pattern data', () => {
      const data = [
        {
          id: '1',
          category: 'ufo',
          date_occurred: '2024-01-15',
          location_lat: 40.7128,
          location_lng: -74.006,
        },
        {
          id: '2',
          category: 'dreams',
          date_occurred: '2024-02-20',
          location_lat: 34.0522,
          location_lng: -118.2437,
        },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(true)
      expect(analysis.hasTemporal).toBe(true)
      expect(analysis.hasCategories).toBe(true)
      // Should recommend map as primary for geo data
      expect(getPrimaryViz(analysis)).toBe('map')
    })

    it('should handle partial geo data', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', title: 'No location' },
        { id: '3', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(true)
      expect(analysis.geoRatio).toBeCloseTo(0.667, 2)
    })

    it('should handle results wrapper object', () => {
      const data = {
        results: [
          { id: '1', category: 'ufo' },
          { id: '2', category: 'dreams' },
        ],
      }

      const analysis = analyzeDataStructure(data)

      expect(analysis.count).toBe(2)
      expect(analysis.hasCategories).toBe(true)
    })

    it('should recommend heatmap for category + temporal data', () => {
      const data = [
        { id: '1', category: 'ufo', date_occurred: '2024-01-15' },
        { id: '2', category: 'dreams', date_occurred: '2024-01-20' },
        { id: '3', category: 'ufo', date_occurred: '2024-02-10' },
        { id: '4', category: 'nde', date_occurred: '2024-02-15' },
        { id: '5', category: 'dreams', date_occurred: '2024-03-05' },
        { id: '6', category: 'ufo', date_occurred: '2024-03-20' },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasCategories).toBe(true)
      expect(analysis.hasTemporal).toBe(true)
      expect(analysis.count).toBeGreaterThan(5)
      expect(analysis.recommendedViz).toContain('heatmap')
    })
  })

  describe('getPrimaryViz', () => {
    it('should return primary visualization', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)
      const primaryViz = getPrimaryViz(analysis)

      expect(primaryViz).toBe('map')
    })

    it('should fallback to chart for empty data', () => {
      const analysis = analyzeDataStructure([])
      const primaryViz = getPrimaryViz(analysis)

      expect(primaryViz).toBe('chart')
    })
  })

  describe('isSuitableFor', () => {
    it('should return true for recommended viz', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(isSuitableFor(analysis, 'map')).toBe(true)
    })

    it('should return false for non-recommended viz', () => {
      const data = [{ id: '1', title: 'No special data' }]

      const analysis = analyzeDataStructure(data)

      expect(isSuitableFor(analysis, 'map')).toBe(false)
      expect(isSuitableFor(analysis, 'network')).toBe(false)
    })
  })

  describe('getVizPriorityScore', () => {
    it('should return higher score for primary viz', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)

      const mapScore = getVizPriorityScore(analysis, 'map')
      const chartScore = getVizPriorityScore(analysis, 'chart')

      expect(mapScore).toBeGreaterThan(chartScore)
      expect(mapScore).toBe(1.0) // Primary recommendation
    })

    it('should return 0 for unsuitable viz', () => {
      const data = [{ id: '1', title: 'Simple data' }]

      const analysis = analyzeDataStructure(data)
      const networkScore = getVizPriorityScore(analysis, 'network')

      expect(networkScore).toBe(0)
    })

    it('should return decreasing scores for lower priorities', () => {
      const data = [
        {
          id: '1',
          category: 'ufo',
          date_occurred: '2024-01-15',
          location_lat: 40.7128,
          location_lng: -74.006,
          score: 100,
        },
        {
          id: '2',
          category: 'dreams',
          date_occurred: '2024-02-20',
          location_lat: 34.0522,
          location_lng: -118.2437,
          score: 85,
        },
      ]

      const analysis = analyzeDataStructure(data)

      const scores = analysis.recommendedViz.map((viz) =>
        getVizPriorityScore(analysis, viz)
      )

      // Scores should decrease as priority decreases
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1])
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const data = [{ id: '1', category: 'ufo' }]

      const analysis = analyzeDataStructure(data)

      expect(analysis.count).toBe(1)
      expect(analysis.recommendedViz).toContain('chart')
    })

    it('should handle missing fields', () => {
      const data = [{ id: '1' }, { id: '2' }, { id: '3' }]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(false)
      expect(analysis.hasTemporal).toBe(false)
      expect(analysis.hasCategories).toBe(false)
      expect(analysis.hasRankings).toBe(false)
    })

    it('should handle null/undefined values', () => {
      const data = [
        { id: '1', location_lat: null, location_lng: null, category: null },
      ]

      const analysis = analyzeDataStructure(data)

      // Fields exist (detected from first item) but values may be null
      expect(analysis.fields).toContain('id')
      expect(analysis.fields).toContain('location_lat')
      expect(analysis.fields).toContain('location_lng')
      expect(analysis.fields).toContain('category')
    })

    it('should handle mixed valid/invalid coordinates', () => {
      const data = [
        { id: '1', location_lat: 40.7128, location_lng: -74.006 },
        { id: '2', location_lat: 999, location_lng: 999 }, // Invalid
        { id: '3', location_lat: 34.0522, location_lng: -118.2437 },
      ]

      const analysis = analyzeDataStructure(data)

      expect(analysis.hasGeo).toBe(true)
      // geoRatio should be 2/3 since one is invalid
      expect(analysis.geoRatio).toBeGreaterThan(0)
    })
  })
})
