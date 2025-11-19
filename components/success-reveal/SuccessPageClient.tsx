'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, Share2, PlusCircle } from 'lucide-react'
import { SuccessTabs, TabId } from './SuccessTabs'
import { TabContent } from './TabContent'
import { InteractiveExperienceMap } from './InteractiveExperienceMap'
import { TemporalTimeline } from './TemporalTimeline'
import { EnhancedListTab } from './EnhancedListTab'
import { PatternRevealSection } from './PatternRevealSection'
import { DiscoveryPanel } from './DiscoveryPanel'
import { ConcreteImpactSummary } from './ConcreteImpactSummary'

interface MapData {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  date: string
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  isUserExperience: boolean
}

interface SimilarExperience {
  id: string
  title: string
  summary?: string
  category: string
  date: string
  location?: {
    city?: string
    country?: string
  }
  matchScore: number
  matchReasons?: string[]
}

interface PatternData {
  type: 'geographic' | 'temporal' | 'tag_network' | 'cross_category' | 'witness_network' | 'sequential' | 'user_connection' | 'location_chain' | 'temporal_wave' | 'tag_sequence'
  data: any
}

interface SuccessPageClientProps {
  category: string
  experienceId: string
  userExperienceDate: string

  // Map data
  hasLocation: boolean
  centerLat?: number
  centerLng?: number
  mapData: MapData[]

  // Timeline data
  timelineEvents: TimelineEvent[]

  // Similar experiences
  similarExperiences: SimilarExperience[]

  // Patterns
  patternData: PatternData[]

  // Discovery panel props
  attributes: string[]
  aiConfidence: number
  location?: { city?: string; country?: string }
  dateOccurred: string

  // Impact metrics
  contributionMetrics: any
  patterns: any[]
  isFirstInLocation?: boolean
}

export function SuccessPageClient({
  category,
  experienceId,
  userExperienceDate,
  hasLocation,
  centerLat,
  centerLng,
  mapData,
  timelineEvents,
  similarExperiences,
  patternData,
  attributes,
  aiConfidence,
  location,
  dateOccurred,
  contributionMetrics,
  patterns,
  isFirstInLocation,
}: SuccessPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('map')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <SuccessTabs
        category={category}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        similarCount={similarExperiences.length}
      />

      {/* Tab Contents */}
      <TabContent activeTab={activeTab} tabId="map">
        {hasLocation && centerLat && centerLng && mapData.length > 0 ? (
          <InteractiveExperienceMap
            category={category}
            centerLat={centerLat}
            centerLng={centerLng}
            similarExperiences={mapData}
            radius={50}
          />
        ) : (
          <div className="py-12 text-center text-white/60">
            <p>No location data available for map visualization.</p>
          </div>
        )}
      </TabContent>

      <TabContent activeTab={activeTab} tabId="timeline">
        {timelineEvents.length > 0 ? (
          <TemporalTimeline
            category={category}
            userExperienceDate={userExperienceDate}
            similarExperiences={timelineEvents}
            showPrediction={true}
          />
        ) : (
          <div className="py-12 text-center text-white/60">
            <p>Not enough temporal data for timeline visualization.</p>
          </div>
        )}
      </TabContent>

      <TabContent activeTab={activeTab} tabId="list">
        {similarExperiences.length > 0 ? (
          <EnhancedListTab
            experiences={similarExperiences}
            userLocation={location}
          />
        ) : (
          <div className="py-12 text-center text-white/60">
            <p>No similar experiences found yet. You might be the first!</p>
          </div>
        )}
      </TabContent>

      <TabContent activeTab={activeTab} tabId="patterns">
        <div className="space-y-6">
          {patternData.length > 0 ? (
            <PatternRevealSection
              category={category}
              patterns={patternData}
              similarCount={similarExperiences.length}
            />
          ) : (
            <div className="py-12 text-center text-white/60">
              <p>No patterns detected yet. Patterns emerge as more experiences are shared.</p>
            </div>
          )}

          {/* Discovery Panel */}
          <DiscoveryPanel
            category={category}
            attributes={attributes}
            aiConfidence={aiConfidence}
            location={location}
            dateOccurred={dateOccurred}
          />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} tabId="you">
        <div className="space-y-6">
          {/* Concrete Impact Summary */}
          <ConcreteImpactSummary
            category={category}
            metrics={{
              similarExperiencesCount: similarExperiences.length,
              geographicRank: location ? {
                position: similarExperiences.filter((exp) => {
                  return exp.location?.city === location.city
                }).length + 1,
                location: location.city || 'Unknown',
                totalInLocation: similarExperiences.filter((exp) => {
                  return exp.location?.city === location.city
                }).length + 1,
              } : undefined,
              patternContributions: patterns.map((p) => ({
                type: p.type,
                impact: `${p.count || 0} ${p.type} pattern connections`,
              })),
              uniqueAttributes: attributes.filter(() => true),
              isFirstInLocation,
            }}
          />
        </div>
      </TabContent>
    </div>
  )
}
