'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Brain, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIInsightsRibbonProps {
  patternStrength: number;
  similarCount: number;
  categoryMatches: number;
  locationMatches: number;
  temporalMatches: number;
  hasActiveWave: boolean;
  category: string;
  locationText?: string;
}

export function AIInsightsRibbon({
  patternStrength,
  similarCount,
  categoryMatches,
  locationMatches,
  temporalMatches,
  hasActiveWave,
  category,
  locationText,
}: AIInsightsRibbonProps) {
  // Generate AI insights based on pattern data
  const insights = generateInsights({
    patternStrength,
    similarCount,
    categoryMatches,
    locationMatches,
    temporalMatches,
    hasActiveWave,
    category,
    locationText,
  });

  // Don't render if no significant insights
  if (insights.length === 0) return null;

  const primaryInsight = insights[0];
  const secondaryInsights = insights.slice(1, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="my-6"
    >
      <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-blue-950/20 to-purple-950/20">
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                AI Pattern Analysis
                <Badge variant="secondary" className="text-xs">
                  {patternStrength}% confidence
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Based on {similarCount} similar experiences
              </p>
            </div>
          </div>

          {/* Primary Insight */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {primaryInsight.icon}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{primaryInsight.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {primaryInsight.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Secondary Insights */}
          {secondaryInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {secondaryInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {insight.icon}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface Insight {
  icon: React.ReactElement;
  title: string;
  description: string;
  priority: number;
}

function generateInsights(data: {
  patternStrength: number;
  similarCount: number;
  categoryMatches: number;
  locationMatches: number;
  temporalMatches: number;
  hasActiveWave: boolean;
  category: string;
  locationText?: string;
}): Insight[] {
  const insights: Insight[] = [];

  // Active Wave Insight (Highest Priority)
  if (data.hasActiveWave) {
    insights.push({
      icon: <TrendingUp className="w-4 h-4 text-red-400" />,
      title: 'Active Wave Detected',
      description: `Your ${data.category} experience is part of a trending wave with ${data.similarCount} similar reports. This pattern shows significant recent activity, suggesting a widespread phenomenon that warrants attention.`,
      priority: 100,
    });
  }

  // Strong Pattern Insight
  if (data.patternStrength >= 70) {
    insights.push({
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: 'Strong Pattern Match',
      description: `This experience shows ${data.patternStrength}% pattern similarity with ${data.similarCount} others. The high correlation suggests you're experiencing something shared by many, not an isolated incident.`,
      priority: 90,
    });
  }

  // Geographic Cluster Insight
  if (data.locationMatches >= 5) {
    const location = data.locationText?.split(',')[0] || 'this area';
    insights.push({
      icon: <Lightbulb className="w-4 h-4 text-blue-400" />,
      title: 'Geographic Clustering',
      description: `${data.locationMatches} similar experiences reported near ${location}. This spatial concentration could indicate a localized phenomenon or shared environmental factors.`,
      priority: 80,
    });
  }

  // Category Insight
  if (data.categoryMatches >= 10) {
    insights.push({
      icon: <Brain className="w-4 h-4 text-green-400" />,
      title: `${data.category} Pattern`,
      description: `${data.categoryMatches} matching ${data.category} experiences found. This category shows consistent reporting patterns, helping researchers identify common characteristics and potential explanations.`,
      priority: 70,
    });
  }

  // Temporal Pattern Insight
  if (data.temporalMatches >= 5) {
    insights.push({
      icon: <Sparkles className="w-4 h-4 text-orange-400" />,
      title: 'Temporal Correlation',
      description: `${data.temporalMatches} experiences occurred during similar timeframes. This temporal clustering may reveal time-dependent patterns or cyclical phenomena.`,
      priority: 60,
    });
  }

  // Medium Pattern Insight
  if (data.patternStrength >= 40 && data.patternStrength < 70) {
    insights.push({
      icon: <Brain className="w-4 h-4 text-blue-400" />,
      title: 'Moderate Pattern Match',
      description: `Your experience shows ${data.patternStrength}% similarity with ${data.similarCount} others. While not a perfect match, there are notable commonalities that contribute to pattern understanding.`,
      priority: 50,
    });
  }

  // Low but Significant Insight
  if (data.patternStrength >= 20 && data.patternStrength < 40 && data.similarCount >= 5) {
    insights.push({
      icon: <Lightbulb className="w-4 h-4 text-purple-400" />,
      title: 'Emerging Pattern',
      description: `Your experience connects to ${data.similarCount} others with ${data.patternStrength}% similarity. This emerging pattern may become more defined as more data is collected.`,
      priority: 40,
    });
  }

  // Sort by priority (highest first) and return
  return insights.sort((a, b) => b.priority - a.priority);
}
