'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export function DraftStatusBadge() {
  const { isDraft, lastSaved } = useSubmitFlowStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDraft || !lastSaved) return null;

  const timeAgo = formatDistanceToNow(new Date(lastSaved), {
    addSuffix: true,
    locale: de,
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-4 right-4 z-50 pointer-events-none"
      >
        <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-xs border-green-500/30 bg-green-500/10">
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-text-secondary">
            Draft gespeichert {timeAgo}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
