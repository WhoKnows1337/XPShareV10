'use client';

import { useState, useEffect } from 'react';
import { DiscoveryLoadingModal } from './DiscoveryLoadingModal';

/**
 * DiscoveryLoadingModalWrapper - Client Component Wrapper
 *
 * Manages state for DiscoveryLoadingModal since parent is Server Component.
 * Shows modal when justPublished=true, then hides after completion.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 1, Task 1.3
 */

interface DiscoveryLoadingModalWrapperProps {
  initiallyOpen: boolean;
}

export function DiscoveryLoadingModalWrapper({
  initiallyOpen,
}: DiscoveryLoadingModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  // Auto-open on mount if initiallyOpen=true
  useEffect(() => {
    if (initiallyOpen) {
      setIsOpen(true);
    }
  }, [initiallyOpen]);

  return (
    <DiscoveryLoadingModal
      isOpen={isOpen}
      onComplete={() => setIsOpen(false)}
    />
  );
}
