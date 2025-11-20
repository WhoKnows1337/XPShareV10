'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { DiscoveryLoadingScreen } from '@/components/discovery/DiscoveryLoadingScreen';

export function SuccessScreen() {
  const { publishResult } = useSubmitFlowStore();

  // If no publish result, show nothing (shouldn't happen)
  if (!publishResult) {
    return null;
  }

  // Show the new Discovery Loading Screen
  // This will stream events and auto-redirect to the unified experience page
  return <DiscoveryLoadingScreen experienceId={publishResult.experienceId} />;
}
