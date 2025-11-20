'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCard {
  id: string;
  title: string;
  content: ReactNode;
}

interface MobileSwipeableCardsProps {
  cards: SwipeableCard[];
}

export function MobileSwipeableCards({ cards }: MobileSwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const xRange = [-100, 0, 100];
  const opacityRange = [0.3, 1, 0.3];
  const opacity = useTransform(x, xRange, opacityRange);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // Minimum swipe distance
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        // Swipe right - go to previous card
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < 0 && currentIndex < cards.length - 1) {
        // Swipe left - go to next card
        setCurrentIndex(currentIndex + 1);
      }
    }

    // Reset position
    x.set(0);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Swipeable Cards Container */}
      <div className="relative h-[600px] sm:h-[700px] md:h-[800px]">
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x, opacity }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="w-full h-full px-4">
            <div className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40 rounded-lg overflow-y-auto">
              {/* Card Header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3">
                <h3 className="text-sm font-medium">{cards[currentIndex].title}</h3>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {cards[currentIndex].content}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {currentIndex < cards.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4 pb-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to ${card.title}`}
          />
        ))}
      </div>

      {/* Swipe Hint (shown on first render) */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/90 backdrop-blur border border-border/40 rounded-full text-xs text-muted-foreground pointer-events-none"
        >
          Swipe to explore →
        </motion.div>
      )}
    </div>
  );
}
