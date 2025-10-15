import DiffMatchPatch from 'diff-match-patch';

/**
 * Text Change Classification & Analysis Utility
 *
 * Analyzes changes between two text versions and classifies them
 * for smart re-analysis decisions.
 */

export type ChangeType = 'typo-fix' | 'minor-edit' | 'addition' | 'deletion' | 'major-rewrite';
export type ChangeSeverity = 'trivial' | 'minor' | 'moderate' | 'major';

export interface TextChange {
  type: ChangeType;
  severity: ChangeSeverity;
  affectedWords: number;
  percentageChange: number;
  wordsAdded: number;
  wordsDeleted: number;
  editDistance: number;
  needsReAnalysis: boolean | 'ask-user';
  details: string;
}

export interface TextSegment {
  id: string;
  type: 'original' | 'ai-added' | 'user-added' | 'user-edited';
  text: string;
  start: number;
  end: number;
  source?: {
    type: 'attribute' | 'question';
    key: string;
    label: string;
    value?: string | number;        // User's answer or attribute value
    questionText?: string;           // Original question text (for questions)
    confidence?: number;             // Confidence score (for attributes)
  };
}

/**
 * Re-Analysis thresholds based on change metrics
 */
const RE_ANALYSIS_RULES = {
  trivial: {
    maxEditDistance: 5,
    maxNewWords: 3,
    maxDeletedWords: 3,
    maxPercentage: 0.02, // 2%
  },
  minor: {
    maxEditDistance: 20,
    maxNewWords: 20,
    maxDeletedWords: 10,
    maxPercentage: 0.10, // 10%
  },
  moderate: {
    maxEditDistance: 50,
    maxNewWords: 50,
    maxDeletedWords: 30,
    maxPercentage: 0.25, // 25%
  },
  // Anything beyond moderate = major
};

/**
 * Remove AI-added segments from text for comparison
 * Only compares the original user-written portions
 */
export function removeAISegments(text: string, aiSegments: TextSegment[]): string {
  if (!aiSegments || aiSegments.length === 0) return text;

  const segments = [...aiSegments]
    .filter(s => s.type === 'ai-added')
    .sort((a, b) => b.start - a.start); // Sort descending to remove from end first

  let result = text;
  for (const segment of segments) {
    result = result.substring(0, segment.start) + result.substring(segment.end);
  }

  return result;
}

/**
 * Calculate Levenshtein edit distance using diff-match-patch
 */
export function calculateEditDistance(text1: string, text2: string): number {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(text1, text2);
  return dmp.diff_levenshtein(diffs);
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate detailed diff statistics
 */
export function calculateDiffStats(original: string, edited: string) {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(original, edited);
  dmp.diff_cleanupSemantic(diffs); // Make diffs more human-readable

  let wordsAdded = 0;
  let wordsDeleted = 0;
  let charsAdded = 0;
  let charsDeleted = 0;

  for (const [operation, text] of diffs) {
    const wordCount = countWords(text);
    if (operation === 1) { // INSERT
      wordsAdded += wordCount;
      charsAdded += text.length;
    } else if (operation === -1) { // DELETE
      wordsDeleted += wordCount;
      charsDeleted += text.length;
    }
  }

  const editDistance = dmp.diff_levenshtein(diffs);
  const originalWordCount = countWords(original);
  const percentageChange = originalWordCount > 0
    ? (wordsAdded + wordsDeleted) / originalWordCount
    : (wordsAdded > 0 ? 1.0 : 0.0);

  return {
    wordsAdded,
    wordsDeleted,
    charsAdded,
    charsDeleted,
    editDistance,
    originalWordCount,
    percentageChange,
    diffs,
  };
}

/**
 * Classify change type based on stats
 */
function classifyChangeType(stats: ReturnType<typeof calculateDiffStats>): ChangeType {
  const { wordsAdded, wordsDeleted, editDistance, percentageChange } = stats;

  // Typo fix: Very small edit distance, minimal word changes
  if (editDistance < 10 && wordsAdded < 3 && wordsDeleted < 3) {
    return 'typo-fix';
  }

  // Primarily additions
  if (wordsAdded > 30 && wordsDeleted < 10) {
    return 'addition';
  }

  // Primarily deletions
  if (wordsDeleted > 20 && wordsAdded < 10) {
    return 'deletion';
  }

  // Major rewrite: High percentage change
  if (percentageChange > 0.4) {
    return 'major-rewrite';
  }

  // Default to minor edit
  return 'minor-edit';
}

/**
 * Classify change severity
 */
function classifyChangeSeverity(stats: ReturnType<typeof calculateDiffStats>, type: ChangeType): ChangeSeverity {
  const { editDistance, wordsAdded, wordsDeleted, percentageChange } = stats;

  // Check trivial thresholds
  if (
    editDistance <= RE_ANALYSIS_RULES.trivial.maxEditDistance &&
    wordsAdded <= RE_ANALYSIS_RULES.trivial.maxNewWords &&
    wordsDeleted <= RE_ANALYSIS_RULES.trivial.maxDeletedWords &&
    percentageChange <= RE_ANALYSIS_RULES.trivial.maxPercentage
  ) {
    return 'trivial';
  }

  // Check minor thresholds
  if (
    editDistance <= RE_ANALYSIS_RULES.minor.maxEditDistance &&
    wordsAdded <= RE_ANALYSIS_RULES.minor.maxNewWords &&
    wordsDeleted <= RE_ANALYSIS_RULES.minor.maxDeletedWords &&
    percentageChange <= RE_ANALYSIS_RULES.minor.maxPercentage
  ) {
    return 'minor';
  }

  // Check moderate thresholds
  if (
    editDistance <= RE_ANALYSIS_RULES.moderate.maxEditDistance &&
    wordsAdded <= RE_ANALYSIS_RULES.moderate.maxNewWords &&
    wordsDeleted <= RE_ANALYSIS_RULES.moderate.maxDeletedWords &&
    percentageChange <= RE_ANALYSIS_RULES.moderate.maxPercentage
  ) {
    return 'moderate';
  }

  return 'major';
}

/**
 * Determine if re-analysis is needed
 */
function determineReAnalysisNeed(type: ChangeType, severity: ChangeSeverity, stats: ReturnType<typeof calculateDiffStats>): boolean | 'ask-user' {
  // Trivial changes never need re-analysis
  if (severity === 'trivial') {
    return false;
  }

  // Minor changes don't need re-analysis
  if (severity === 'minor') {
    return false;
  }

  // Moderate additions: ask user
  if (severity === 'moderate' && type === 'addition') {
    return 'ask-user';
  }

  // Moderate deletions: ask user (might invalidate questions)
  if (severity === 'moderate' && type === 'deletion') {
    return 'ask-user';
  }

  // Major changes: always re-analyze
  if (severity === 'major') {
    return true;
  }

  // Large additions: definitely re-analyze
  if (type === 'addition' && stats.wordsAdded > 50) {
    return true;
  }

  // Large deletions: definitely re-analyze
  if (type === 'deletion' && stats.wordsDeleted > 30) {
    return true;
  }

  // Major rewrite: always re-analyze
  if (type === 'major-rewrite') {
    return true;
  }

  // Default: ask user
  return 'ask-user';
}

/**
 * Generate human-readable details about the change
 */
function generateChangeDetails(type: ChangeType, stats: ReturnType<typeof calculateDiffStats>): string {
  const { wordsAdded, wordsDeleted, percentageChange } = stats;

  switch (type) {
    case 'typo-fix':
      return `Typo fixes or minor formatting changes`;
    case 'minor-edit':
      return `Small edits: ${wordsAdded} words added, ${wordsDeleted} words removed`;
    case 'addition':
      return `${wordsAdded} new words added to the text`;
    case 'deletion':
      return `${wordsDeleted} words removed from the text`;
    case 'major-rewrite':
      return `Significant rewrite (~${Math.round(percentageChange * 100)}% changed)`;
    default:
      return 'Text modified';
  }
}

/**
 * Main function: Analyze text changes
 *
 * Compares original text with edited text and returns classification
 * Filters out AI-added segments to only analyze user's original text changes
 */
export function analyzeTextChanges(
  originalText: string,
  editedText: string,
  aiSegments: TextSegment[] = []
): TextChange {
  // Remove AI segments from both versions for fair comparison
  const originalWithoutAI = removeAISegments(originalText, aiSegments);
  const editedWithoutAI = removeAISegments(editedText, aiSegments);

  // Calculate diff statistics
  const stats = calculateDiffStats(originalWithoutAI, editedWithoutAI);

  // Classify the change
  const type = classifyChangeType(stats);
  const severity = classifyChangeSeverity(stats, type);
  const needsReAnalysis = determineReAnalysisNeed(type, severity, stats);
  const details = generateChangeDetails(type, stats);

  return {
    type,
    severity,
    affectedWords: stats.wordsAdded + stats.wordsDeleted,
    percentageChange: stats.percentageChange,
    wordsAdded: stats.wordsAdded,
    wordsDeleted: stats.wordsDeleted,
    editDistance: stats.editDistance,
    needsReAnalysis,
    details,
  };
}

/**
 * Check if text has meaningful changes
 * (used for debouncing / avoiding unnecessary analysis)
 */
export function hasSignificantChanges(original: string, edited: string, threshold: number = 5): boolean {
  if (original === edited) return false;

  const editDistance = calculateEditDistance(original, edited);
  return editDistance >= threshold;
}
