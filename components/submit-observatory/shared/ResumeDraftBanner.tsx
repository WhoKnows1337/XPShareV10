'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { Info, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { UnsavedChangesModal } from './UnsavedChangesModal';

export function ResumeDraftBanner() {
  const { isDraft, currentStep, lastSaved, reset } = useSubmitFlowStore();
  const [showResetModal, setShowResetModal] = useState(false);

  // Only show if there's a draft and we're not on step 1
  if (!isDraft || currentStep === 1 || !lastSaved) return null;

  const timeAgo = formatDistanceToNow(new Date(lastSaved), {
    addSuffix: true,
    locale: de,
  });

  const handleStartFresh = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    reset();
    setShowResetModal(false);
  };

  return (
    <>
      <UnsavedChangesModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="Draft löschen?"
        description="Möchtest du wirklich von vorne anfangen? Alle bisherigen Eingaben werden gelöscht und können nicht wiederhergestellt werden."
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="glass-card p-4 border-accent-cyan/30 bg-accent-cyan/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" />

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Willkommen zurück!
              </h3>
              <p className="text-xs text-text-secondary mb-3">
                Du hast einen Draft in Arbeit von {timeAgo}. Möchtest du weitermachen oder neu anfangen?
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Weitermachen
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartFresh}
                  className="h-8 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Neu anfangen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
