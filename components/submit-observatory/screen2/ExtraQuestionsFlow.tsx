'use client';

import { useState, useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { QuestionCard } from './QuestionCard';

// Mapping between question IDs and attribute keys for pre-filling
const QUESTION_TO_ATTRIBUTE_MAP: Record<string, string> = {
  'object_characteristics': 'shape',
  'movement_pattern': 'movement',
  'sound': 'sound',
};

// Mapping attribute values (English) to German question options
const ATTRIBUTE_TO_OPTION_MAP: Record<string, Record<string, string>> = {
  'shape': {
    'disc': 'Scheibe/Disk',
    'triangle': 'Dreieck',
    'cigar': 'Zigarre',
    'orb': 'Kugel/Orb',
    'sphere': 'Kugel/Orb',
  },
  'movement': {
    'hovering': 'Schwebend/stationär',
    'gliding': 'Langsam gleitend',
    'zigzag': 'Zick-Zack',
    'rapid': 'Extrem schnell',
    'instant_disappearance': 'Plötzlich verschwunden',
  },
  'sound': {
    'humming': 'Summen/Brummen',
    'high_frequency': 'Hochfrequent',
    'metallic': 'Metallisch',
    'whistling': 'Pfeifend',
    'silent': 'Völlige Stille',
  },
};

// Extra questions optimized for UFO sightings and paranormal experiences
const EXTRA_QUESTIONS = [
  {
    id: 'physical_effects',
    title: 'Körperliche Effekte während der Erfahrung?',
    type: 'checkbox' as const,
    options: ['Kopfschmerzen', 'Übelkeit', 'Kribbeln/Elektrisiert', 'Zeitverzerrung', 'Lähmung', 'Keine'],
    tip: 'Körperliche Reaktionen können auf elektromagnetische Felder oder Strahlung hinweisen',
    xp: 15,
  },
  {
    id: 'electromagnetic',
    title: 'Elektromagnetische oder technische Störungen?',
    type: 'checkbox' as const,
    options: ['Lichter flackerten', 'Handy/Elektronik ausgefallen', 'Kompass verrückt', 'Auto stotterte/stoppte', 'Funkgeräusche', 'Keine'],
    tip: 'EM-Effekte sind bei UFO-Sichtungen und paranormalen Events häufig dokumentiert',
    xp: 15,
  },
  {
    id: 'object_characteristics',
    title: 'Falls ein Objekt/Phänomen sichtbar war - welche Form?',
    type: 'checkbox' as const,
    options: ['Scheibe/Disk', 'Dreieck', 'Zigarre', 'Kugel/Orb', 'Unregelmäßig', 'Lichtpunkt', 'Keine/Nicht sichtbar'],
    tip: 'Form-Klassifizierung hilft bei der Mustererkennung mit ähnlichen Sichtungen',
    xp: 15,
  },
  {
    id: 'movement_pattern',
    title: 'Bewegungsmuster des Objekts/Phänomens?',
    type: 'checkbox' as const,
    options: ['Schwebend/stationär', 'Langsam gleitend', 'Zick-Zack', 'Extrem schnell', 'Plötzlich verschwunden', 'Keine Bewegung sichtbar'],
    tip: 'Bewegungsmuster sind wichtig zur Unterscheidung von konventionellen Objekten',
    xp: 15,
  },
  {
    id: 'sound',
    title: 'Geräusche während der Erfahrung?',
    type: 'checkbox' as const,
    options: ['Summen/Brummen', 'Hochfrequent', 'Metallisch', 'Pfeifend', 'Völlige Stille', 'Keine ungewöhnlichen Geräusche'],
    tip: 'Geräuschmuster sind charakteristisch für verschiedene Phänomen-Typen',
    xp: 15,
  },
  {
    id: 'emotional_state',
    title: 'Dein emotionaler Zustand?',
    type: 'scale' as const,
    min: 1,
    max: 10,
    minLabel: 'Extreme Angst',
    maxLabel: 'Tiefer Frieden',
    tip: 'Emotionale Reaktionen helfen bei der Klassifizierung von Begegnungstypen',
    xp: 10,
  },
  {
    id: 'weather',
    title: 'Wetterbedingungen zum Zeitpunkt?',
    type: 'checkbox' as const,
    options: ['Klarer Himmel', 'Bewölkt', 'Regen', 'Nebel', 'Gewitter', 'Dämmerung/Nacht'],
    tip: 'Wetter- und Lichtbedingungen sind wichtig für die Bewertung von Sichtungen',
    xp: 10,
  },
  {
    id: 'aftermath',
    title: 'Nachwirkungen nach der Erfahrung?',
    type: 'checkbox' as const,
    options: ['Müdigkeit/Erschöpfung', 'Schlaflosigkeit', 'Verstärkte Intuition', 'Zeitverlust/Missing Time', 'Hautirritationen', 'Keine Nachwirkungen'],
    tip: 'Langzeitwirkungen können auf die Intensität der Begegnung hinweisen',
    xp: 15,
  },
];

interface ExtraQuestionsFlowProps {
  onComplete: () => void;
}

export function ExtraQuestionsFlow({ onComplete }: ExtraQuestionsFlowProps) {
  const t = useTranslations('submit.screen2.extraQuestions');
  const { screen2, setExtraQuestion, updateScreen2 } = useSubmitFlowStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllConfirm, setShowAllConfirm] = useState(false);

  const currentQuestion = EXTRA_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / EXTRA_QUESTIONS.length) * 100;

  // Check how many questions are pre-filled
  const prefilledQuestions = EXTRA_QUESTIONS.filter((q) => {
    const attributeKey = QUESTION_TO_ATTRIBUTE_MAP[q.id];
    return attributeKey && screen2.attributes[attributeKey];
  });

  const prefilledCount = prefilledQuestions.length;
  const totalXPBonus = prefilledQuestions.reduce((sum, q) => sum + q.xp, 0);

  // Auto-fill question from AI-extracted attributes
  useEffect(() => {
    const questionId = currentQuestion.id;

    // Skip if question already answered
    if (screen2.extraQuestions[questionId]) {
      return;
    }

    // Check if this question maps to an attribute
    const attributeKey = QUESTION_TO_ATTRIBUTE_MAP[questionId];
    if (!attributeKey) {
      return;
    }

    // Check if we have this attribute
    const attribute = screen2.attributes[attributeKey];
    if (!attribute) {
      return;
    }

    // Translate attribute value to question option
    const optionMap = ATTRIBUTE_TO_OPTION_MAP[attributeKey];
    if (!optionMap) {
      return;
    }

    const germanOption = optionMap[attribute.value];
    if (germanOption) {
      // Pre-fill the question with the AI-extracted value
      setExtraQuestion(questionId, [germanOption]);
      console.log(`Pre-filled question "${questionId}" with "${germanOption}" from attribute "${attributeKey}"`);
    }
  }, [currentIndex, currentQuestion.id, screen2.attributes, screen2.extraQuestions, setExtraQuestion]);

  const handleNext = (answer: any) => {
    setExtraQuestion(currentQuestion.id, answer);

    if (currentIndex < EXTRA_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all questions
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentIndex < EXTRA_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      updateScreen2({ completedExtraQuestions: true });
      onComplete();
    }
  };

  const handleSkipAll = () => {
    updateScreen2({ completedExtraQuestions: false });
    onComplete();
  };

  const handleConfirmAll = () => {
    // Confirm all pre-filled questions at once
    prefilledQuestions.forEach((question) => {
      const attributeKey = QUESTION_TO_ATTRIBUTE_MAP[question.id];
      if (attributeKey && screen2.attributes[attributeKey]) {
        const attribute = screen2.attributes[attributeKey];
        const optionMap = ATTRIBUTE_TO_OPTION_MAP[attributeKey];
        const germanOption = optionMap[attribute.value];

        if (germanOption && !screen2.extraQuestions[question.id]) {
          setExtraQuestion(question.id, [germanOption]);
        }
      }
    });

    // Award bonus XP
    console.log(`Alle bestätigen: +${totalXPBonus} XP Bonus`);

    // Mark as completed and continue
    updateScreen2({ completedExtraQuestions: true });
    onComplete();
  };

  return (
    <div className="p-3 bg-glass-bg border border-glass-border rounded">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-observatory-accent">
            Q{currentIndex + 1}/{EXTRA_QUESTIONS.length}
          </span>
          <span className="text-[10px] text-text-tertiary uppercase tracking-wide">
            +{currentQuestion.xp} XP
          </span>
        </div>
        <button
          onClick={handleSkipAll}
          className="text-[10px] text-text-tertiary hover:text-text-secondary uppercase tracking-wide"
        >
          {t('skipAll', 'Alle Skip')}
        </button>
      </div>

      {/* "Alle bestätigen" Button - Show if there are pre-filled questions */}
      {prefilledCount > 0 && (
        <div className="mb-4 p-3 bg-success-soft/10 border border-success-soft/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-success-soft">
                ✨ {prefilledCount} {prefilledCount === 1 ? 'Frage' : 'Fragen'} wurden automatisch ausgefüllt
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Bestätige alle auf einmal und erhalte +{totalXPBonus} XP Bonus
              </p>
            </div>
          </div>
          <button
            onClick={handleConfirmAll}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
          >
            Alle bestätigen (+{totalXPBonus} XP)
          </button>
        </div>
      )}

      {/* Current Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        onNext={handleNext}
        onSkip={handleSkip}
        currentAnswer={screen2.extraQuestions[currentQuestion.id]}
      />

      {/* Compact Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {EXTRA_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i < currentIndex
                ? 'bg-success-soft'
                : i === currentIndex
                ? 'bg-observatory-accent scale-125'
                : 'bg-text-tertiary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
