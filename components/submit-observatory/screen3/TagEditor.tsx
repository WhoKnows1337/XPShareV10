'use client';

import { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagEditorProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  maxTags?: number;
}

export function TagEditor({ tags, onAdd, onRemove, maxTags = 12 }: TagEditorProps) {

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const tag = inputValue.trim().toLowerCase();

    // Validation
    if (!tag) {
      setError('Tag darf nicht leer sein');
      return;
    }

    if (tag.length < 2) {
      setError('Tag muss mindestens 2 Zeichen haben');
      return;
    }

    if (tag.length > 30) {
      setError('Tag darf maximal 30 Zeichen haben');
      return;
    }

    if (tags.includes(tag)) {
      setError('Tag existiert bereits');
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Maximal ${maxTags} Tags erlaubt`);
      return;
    }

    // Add tag
    onAdd(tag);
    setInputValue('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2 min-h-[60px]">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: index * 0.05 }}
              className="group relative"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-glass-bg border border-glass-border hover:border-accent-cyan transition-colors">
                <Hash className="w-3 h-3 text-accent-cyan" />
                <span className="text-xs font-medium text-text-primary">{tag}</span>
                <button
                  onClick={() => onRemove(tag)}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                  aria-label="Tag entfernen"
                >
                  <X className="w-3 h-3 text-text-tertiary group-hover:text-destructive transition-colors" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {tags.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-text-tertiary text-xs"
          >
            <Hash className="w-4 h-4" />
            <span>Keine Tags vorhanden</span>
          </motion.div>
        )}
      </div>

      {/* Add Tag Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Neuer Tag (z.B. 'silent', 'triangle')"
              className="text-sm bg-glass-bg border-glass-border focus:border-accent-cyan"
              disabled={tags.length >= maxTags}
            />
            {inputValue && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary">
                {inputValue.length}/30
              </div>
            )}
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            variant="outline"
            className="shrink-0"
            disabled={tags.length >= maxTags || !inputValue.trim()}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Hinzufügen</span>
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag Count */}
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>
            {tags.length} / {maxTags} Tags
          </span>
          {tags.length >= 8 && tags.length < maxTags && (
            <span className="text-green-400">✓ Optimal</span>
          )}
          {tags.length < 8 && (
            <span className="text-yellow-400">Mindestens 8 empfohlen</span>
          )}
        </div>
      </div>
    </div>
  );
}
