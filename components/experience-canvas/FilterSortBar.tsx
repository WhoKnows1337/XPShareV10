'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, SlidersHorizontal, MapPin, Calendar, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOptions {
  locations: string[];
  timeRange: '7d' | '30d' | 'all';
  minMatchScore: number; // 0-100
  sortBy: 'similarity' | 'recent' | 'closest';
}

interface FilterSortBarProps {
  availableLocations: string[];
  onFilterChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterSortBar({
  availableLocations,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterSortBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'similarity' | 'recent' | 'closest'>('similarity');

  const hasActiveFilters = selectedLocations.length > 0 || timeRange !== 'all' || minMatchScore > 0;

  const applyFilters = () => {
    onFilterChange({
      locations: selectedLocations,
      timeRange,
      minMatchScore,
      sortBy,
    });
  };

  const clearFilters = () => {
    setSelectedLocations([]);
    setTimeRange('all');
    setMinMatchScore(0);
    setSortBy('similarity');
    onFilterChange({
      locations: [],
      timeRange: 'all',
      minMatchScore: 0,
      sortBy: 'similarity',
    });
  };

  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter((l) => l !== location)
      : [...selectedLocations, location];
    setSelectedLocations(newLocations);
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {/* Filter Toggle Button */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                    {selectedLocations.length + (timeRange !== 'all' ? 1 : 0) + (minMatchScore > 0 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-card" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Filter Options</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-auto py-1"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Location Filter */}
                {availableLocations.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      Location
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableLocations.slice(0, 8).map((location) => (
                        <Button
                          key={location}
                          variant={selectedLocations.includes(location) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleLocation(location)}
                          className="text-xs h-auto py-1"
                        >
                          {location}
                          {selectedLocations.includes(location) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Range Filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Time Range
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={timeRange === '7d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('7d')}
                      className="flex-1 text-xs"
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant={timeRange === '30d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('30d')}
                      className="flex-1 text-xs"
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant={timeRange === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('all')}
                      className="flex-1 text-xs"
                    >
                      All time
                    </Button>
                  </div>
                </div>

                {/* Match Score Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Min Match Score
                    </div>
                    <span className="text-xs text-muted-foreground">{minMatchScore}%</span>
                  </div>
                  <Slider
                    value={[minMatchScore]}
                    onValueChange={(value) => setMinMatchScore(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Apply Button */}
                <Button onClick={applyFilters} className="w-full" size="sm">
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px] h-9">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Sort by..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="similarity">Most Similar</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="closest">Closest Location</SelectItem>
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className="ml-auto text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <>
                Showing {filteredCount} of {totalCount}
              </>
            ) : (
              <>
                {totalCount} experience{totalCount !== 1 ? 's' : ''}
              </>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10"
            >
              {selectedLocations.map((location) => (
                <Badge
                  key={location}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => toggleLocation(location)}
                >
                  <MapPin className="w-3 h-3" />
                  {location}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              {timeRange !== 'all' && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setTimeRange('all')}
                >
                  <Calendar className="w-3 h-3" />
                  {timeRange === '7d' ? 'Last 7 days' : 'Last 30 days'}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {minMatchScore > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setMinMatchScore(0)}
                >
                  <TrendingUp className="w-3 h-3" />
                  Min {minMatchScore}% match
                  <X className="w-3 h-3" />
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
