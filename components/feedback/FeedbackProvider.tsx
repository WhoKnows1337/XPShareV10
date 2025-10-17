'use client';

import { useEffect } from 'react';
import { FeedbackWidget } from './FeedbackWidget';
import { initializeConsoleTracking } from './screenshot-utils';

export function FeedbackProvider() {
  useEffect(() => {
    // Initialize console tracking for bug reports
    initializeConsoleTracking();
  }, []);

  return <FeedbackWidget />;
}
