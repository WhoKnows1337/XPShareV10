'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { TagEditor } from './TagEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { FileText, Tag, FolderOpen, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface MetadataSidebarProps {
  categories?: Array<{ slug: string; name: string }>;
  onRegenerateSummary?: () => void;
  isSummarizing?: boolean;
}

export function MetadataSidebar({ categories = [], onRegenerateSummary, isSummarizing }: MetadataSidebarProps) {
  const { screen2, screen3, setTitle, setCategory, addTag, removeTag, setSummary } = useSubmitFlowStore();
  const [showAttributes, setShowAttributes] = useState(false);

  const titleLength = screen2.title.length;
  const summaryLength = screen3.summary?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4 lg:sticky lg:top-4"
    >
      {/* Sidebar Card */}
      <div className="glass-card p-4 space-y-5">
        {/* Header */}
        <div className="pb-3 border-b border-glass-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-cyan" />
            Finale Metadaten
          </h3>
          <p className="text-xs text-text-tertiary mt-1">
            Alles editierbar vor dem Veröffentlichen
          </p>
        </div>

        {/* Title Editor */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-medium text-text-primary flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Titel
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan">
              AI
            </span>
          </Label>
          <div className="relative">
            <Input
              id="title"
              value={screen2.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel eingeben..."
              className="text-sm bg-glass-bg/50 border-glass-border focus:border-accent-cyan pr-12"
              maxLength={80}
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium ${
              titleLength >= 20 && titleLength <= 80
                ? 'text-green-400'
                : titleLength > 80
                  ? 'text-destructive'
                  : 'text-yellow-400'
            }`}>
              {titleLength}/80
            </div>
          </div>
          {titleLength < 20 && (
            <p className="text-[10px] text-yellow-400">
              Mindestens 20 Zeichen empfohlen
            </p>
          )}
        </div>

        {/* Summary Editor */}
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-xs font-medium text-text-primary flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Zusammenfassung
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple">
              AI
            </span>
          </Label>
          <div className="relative">
            <Textarea
              id="summary"
              value={screen3.summary || ''}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Zusammenfassung eingeben..."
              className="text-sm bg-glass-bg/50 border-glass-border focus:border-accent-cyan resize-none h-24"
              maxLength={250}
            />
            <div className={`absolute right-3 bottom-2 text-[10px] font-medium ${
              summaryLength >= 150 && summaryLength <= 250
                ? 'text-green-400'
                : summaryLength > 250
                  ? 'text-destructive'
                  : 'text-yellow-400'
            }`}>
              {summaryLength}/250
            </div>
          </div>
          {summaryLength < 150 && (
            <p className="text-[10px] text-yellow-400">
              150-250 Zeichen optimal für Feed-Preview
            </p>
          )}
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs font-medium text-text-primary flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            Kategorie
          </Label>
          <Select value={screen2.category} onValueChange={setCategory}>
            <SelectTrigger className="text-sm bg-glass-bg/50 border-glass-border focus:border-accent-cyan">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={screen2.category}>{screen2.category}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Editor */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-primary flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Tags
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">
              AI
            </span>
          </Label>
          <TagEditor
            tags={screen2.tags}
            onAdd={addTag}
            onRemove={removeTag}
            maxTags={12}
          />
        </div>

        {/* Attributes Accordion */}
        <div className="pt-3 border-t border-glass-border">
          <button
            onClick={() => setShowAttributes(!showAttributes)}
            className="w-full flex items-center justify-between text-xs font-medium text-text-primary hover:text-accent-cyan transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Erkannte Attribute
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-glass-bg text-text-tertiary">
                {Object.keys(screen2.attributes || {}).length}
              </span>
            </div>
            {showAttributes ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAttributes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 text-xs"
            >
              {Object.entries(screen2.attributes || {}).length > 0 ? (
                Object.entries(screen2.attributes).map(([key, attr]: [string, any]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-2 p-2 rounded bg-glass-bg/50 border border-glass-border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-text-primary capitalize">{key}</div>
                      <div className="text-text-secondary mt-0.5">{attr.value}</div>
                    </div>
                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan">
                      {Math.round(attr.confidence)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-text-tertiary text-center py-3">
                  Keine Attribute erkannt
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card p-3 bg-accent-cyan/5 border-accent-cyan/30">
        <p className="text-xs text-text-secondary leading-relaxed">
          💡 Diese Metadaten werden für Suche und Pattern-Matching verwendet. Je präziser, desto besser die Ergebnisse!
        </p>
      </div>
    </motion.div>
  );
}
