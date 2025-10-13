'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { QuestionCard } from './QuestionCard';

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

  const currentQuestion = EXTRA_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / EXTRA_QUESTIONS.length) * 100;

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
