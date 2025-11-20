'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number; // 0-100
}

export function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  const config = {
    high: {
      icon: CheckCircle2,
      label: 'High Match',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    medium: {
      icon: AlertCircle,
      label: 'Medium Match',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
    },
    low: {
      icon: HelpCircle,
      label: 'Low Match',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
  };

  const { icon: Icon, label, color, bgColor, borderColor } = config[level];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 ${bgColor} ${borderColor} ${color} border`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{label}</span>
      {score !== undefined && (
        <span className="text-xs font-semibold ml-1">{score}%</span>
      )}
    </Badge>
  );
}
