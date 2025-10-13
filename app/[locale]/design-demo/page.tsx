'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const THEMES = [
  { id: 'cyber', name: '🔮 Cyber Neon', desc: 'Cyan/Magenta, eckig, Glows' },
  { id: 'minimal', name: '⚫ Minimal Dark', desc: 'Clean, rund, subtil' },
  { id: 'glass', name: '🪟 Glassmorphism', desc: 'Apple-Style, Blur' },
  { id: 'synthwave', name: '🌆 Synthwave', desc: '80s Pink/Purple' },
  { id: 'luxury', name: '👑 Luxury', desc: 'Gold/Schwarz' },
];

export default function DesignDemoPage() {
  const [theme, setTheme] = useState('cyber');
  const [tags, setTags] = useState(['ufo', 'nachtlicht', 'unexplained']);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className={`min-h-screen p-8 theme-${theme}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Theme Switcher */}
        <div className="card-demo p-4 sticky top-4 z-50">
          <h2 className="text-sm font-bold text-primary-demo mb-3">🎨 Choose Theme:</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`btn-demo-sm text-left ${theme === t.id ? 'active' : ''}`}
              >
                <div className="font-semibold text-xs">{t.name}</div>
                <div className="text-[10px] opacity-60 truncate">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-demo mb-2">
            XPShare Design System 2025
          </h1>
          <p className="text-secondary-demo text-sm">
            Theme: <span className="font-bold">{THEMES.find(t => t.id === theme)?.name}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="card-demo-compact">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-demo">
            <span className="text-xs font-mono text-tertiary-demo">STEP 2/4</span>
            <span className="text-xs font-mono text-accent-demo">50%</span>
          </div>
          <div className="relative h-1 bg-bg-subtle overflow-hidden">
            <div className="h-full bg-progress-demo" style={{ width: '50%' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent-demo rounded-full" />
            </div>
          </div>
          <div className="px-4 py-2">
            <p className="text-sm text-secondary-demo">AI Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <div className="card-demo p-6">
            <h2 className="text-lg font-bold text-primary-demo mb-4">Buttons</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button className="btn-demo">Primary</button>
                <button className="btn-demo-outline">Outline</button>
                <button className="btn-demo-ghost">Ghost</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-demo-sm">Small</button>
                <button className="btn-demo-sm" disabled>Disabled</button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card-demo p-6">
            <h2 className="text-lg font-bold text-primary-demo mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <div key={tag} className="tag-demo group">
                  <span>#{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="input-demo flex-1"
              />
              <button onClick={addTag} className="btn-demo-sm">
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-demo p-4">
            <h3 className="text-sm font-bold text-accent-demo mb-2">Standard Card</h3>
            <p className="text-xs text-secondary-demo">Default styling</p>
          </div>
          <div className="card-demo-compact p-4">
            <h3 className="text-sm font-bold text-accent-demo mb-2">Compact</h3>
            <p className="text-xs text-secondary-demo">Less padding</p>
          </div>
          <div className="card-demo p-4 border-l-4 border-accent-demo">
            <h3 className="text-sm font-bold text-accent-demo mb-2">Accent</h3>
            <p className="text-xs text-secondary-demo">With border</p>
          </div>
        </div>

        {/* Input */}
        <div className="card-demo p-6">
          <h2 className="text-lg font-bold text-primary-demo mb-4">Input Field</h2>
          <input
            type="text"
            placeholder="Type something..."
            className="input-demo w-full"
          />
        </div>
      </div>
    </div>
  );
}
