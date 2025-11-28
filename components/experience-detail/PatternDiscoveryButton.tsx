'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatternDiscoveryModal } from './PatternDiscoveryModal';

/**
 * PatternDiscoveryButton - Phase 4, Task 4.1
 *
 * Triggers pattern discovery on user request.
 * Shows PatternDiscoveryModal with analysis progress.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 4
 */

interface PatternDiscoveryButtonProps {
  experienceId: string;
}

export function PatternDiscoveryButton({ experienceId }: PatternDiscoveryButtonProps) {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscoverPatterns = async () => {
    setIsDiscovering(true);
    // Modal will handle the actual discovery process
  };

  return (
    <>
      <Button
        onClick={handleDiscoverPatterns}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        <span>Discover Patterns</span>
      </Button>

      <PatternDiscoveryModal
        isOpen={isDiscovering}
        experienceId={experienceId}
        onComplete={() => setIsDiscovering(false)}
        onClose={() => setIsDiscovering(false)}
      />
    </>
  );
}
