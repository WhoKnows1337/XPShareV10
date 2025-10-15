'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { analyzeTextChanges } from '@/lib/utils/text-diff';
import type { TextChange } from '@/lib/utils/text-diff';

interface UseTextChangeDetectionOptions {
  debounceMs?: number;
  onChangeDetected?: (change: TextChange) => void;
  onReAnalysisNeeded?: (change: TextChange) => void;
  enabled?: boolean;
}

/**
 * Hook for detecting and classifying text changes during the submission flow
 *
 * Monitors text edits and triggers re-analysis prompts based on change severity:
 * - Trivial changes: No action
 * - Minor changes: Silent tracking
 * - Moderate changes: Offer re-analysis
 * - Major changes: Recommend re-analysis
 *
 * @param options Configuration options
 */
export function useTextChangeDetection(options: UseTextChangeDetectionOptions = {}) {
  const {
    debounceMs = 1000,
    onChangeDetected,
    onReAnalysisNeeded,
    enabled = true,
  } = options;

  const {
    screen1,
    screen3,
    logTextChange,
    setReAnalysisNeeded,
    reAnalysisOffered,
    setReAnalysisOffered,
  } = useSubmitFlowStore();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousTextRef = useRef<string>('');
  const lastAnalyzedTextRef = useRef<string>('');

  // Initialize previous text from store on mount
  useEffect(() => {
    if (!previousTextRef.current && screen3.textVersions?.current) {
      previousTextRef.current = screen3.textVersions.current;
      lastAnalyzedTextRef.current = screen3.textVersions.current;
    }
  }, [screen3.textVersions?.current]);

  /**
   * Analyze text changes and trigger appropriate actions
   */
  const analyzeChanges = useCallback((currentText: string) => {
    if (!enabled) return;
    if (!previousTextRef.current) return;
    if (currentText === lastAnalyzedTextRef.current) return;

    // Get the original text before AI enhancement
    const baselineText = screen3.textVersions?.afterAIEnhancement || screen1.text;

    // Analyze changes compared to baseline
    const change = analyzeTextChanges(
      baselineText,
      currentText,
      screen3.segments
    );

    // Log the change
    logTextChange(change);

    // Trigger callback
    if (onChangeDetected) {
      onChangeDetected(change);
    }

    // Update last analyzed text
    lastAnalyzedTextRef.current = currentText;

    // Handle re-analysis logic
    if (change.needsReAnalysis === true) {
      // Major changes - Auto-set re-analysis needed
      setReAnalysisNeeded(true);
      if (onReAnalysisNeeded && !reAnalysisOffered) {
        onReAnalysisNeeded(change);
        setReAnalysisOffered(true);
      }
    } else if (change.needsReAnalysis === 'ask-user') {
      // Moderate changes - Ask user
      setReAnalysisNeeded(false); // Don't force, but offer
      if (onReAnalysisNeeded && !reAnalysisOffered) {
        onReAnalysisNeeded(change);
        setReAnalysisOffered(true);
      }
    }
    // For trivial/minor changes, do nothing
  }, [
    enabled,
    screen1.text,
    screen3.segments,
    screen3.textVersions?.afterAIEnhancement,
    logTextChange,
    setReAnalysisNeeded,
    reAnalysisOffered,
    setReAnalysisOffered,
    onChangeDetected,
    onReAnalysisNeeded,
  ]);

  /**
   * Debounced text change handler
   */
  const handleTextChange = useCallback((newText: string) => {
    if (!enabled) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      analyzeChanges(newText);
      previousTextRef.current = newText;
    }, debounceMs);
  }, [enabled, debounceMs, analyzeChanges]);

  /**
   * Manual trigger for immediate analysis (e.g., on blur)
   */
  const triggerAnalysis = useCallback(() => {
    if (!enabled) return;

    const currentText = screen3.textVersions?.current || screen1.text;

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    analyzeChanges(currentText);
    previousTextRef.current = currentText;
  }, [enabled, screen3.textVersions?.current, screen1.text, analyzeChanges]);

  /**
   * Reset detection state (e.g., after re-analysis completes)
   */
  const resetDetection = useCallback(() => {
    const currentText = screen3.textVersions?.current || screen1.text;
    previousTextRef.current = currentText;
    lastAnalyzedTextRef.current = currentText;
    setReAnalysisOffered(false);
    setReAnalysisNeeded(false);
  }, [screen3.textVersions?.current, screen1.text, setReAnalysisOffered, setReAnalysisNeeded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    handleTextChange,
    triggerAnalysis,
    resetDetection,
    reAnalysisNeeded: screen3.reAnalysisNeeded,
    changeLog: screen3.changeLog,
  };
}
