'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, animate } from 'framer-motion';
import Card from '@/components/Card';
import { Script } from '@/types';
import scriptsData from '@/data/scripts.json';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const ITEM_HEIGHT_GUESS = 300;
const PEEK_SCALE = 0.85;
const PEEK_OPACITY = 0.5;
const DRAG_THRESHOLD_MODIFIED = 50;

const transitionSpec = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

// Define a consistent type for custom data passed to variants
type CardVariantCustomData = {
  isExpanded: boolean;
  currentYDrag?: number;
  direction?: number; // For initial/exit animations primarily
};

export default function HomePage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevCurrentIndex, setPrevCurrentIndex] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setScripts(scriptsData as Script[]);
  }, []);

  const navigate = useCallback((direction: number) => {
    if (!scripts.length || isAnimating) return;

    setIsAnimating(true);
    setPrevCurrentIndex(currentIndex);

    if (expandedCardId !== null) {
      setExpandedCardId(null);
      setTimeout(() => {
        setCurrentIndex(prev => {
          const newIndex = prev + direction;
          if (newIndex >= 0 && newIndex < scripts.length) {
            return newIndex;
          }
          return prev;
        });
      }, 150); 
    } else {
      setCurrentIndex(prev => {
        const newIndex = prev + direction;
        if (newIndex >= 0 && newIndex < scripts.length) {
          return newIndex;
        }
        return prev;
      });
    }
  }, [scripts.length, currentIndex, expandedCardId, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      const animationDuration = (transitionSpec.stiffness > 0 ? 1000 / transitionSpec.stiffness : 0) * 5 + 300; 
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return;
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (offset < -DRAG_THRESHOLD_MODIFIED || velocity < -300) {
      navigate(1);
    } else if (offset > DRAG_THRESHOLD_MODIFIED || velocity > 300) {
      navigate(-1);
    }
  };

  const handleCardTap = (id: number) => {
    if (isAnimating) return;
    const tappedScriptIndex = scripts.findIndex(s => s.id === id);

    if (tappedScriptIndex !== -1 && tappedScriptIndex !== currentIndex) {
      // 前後のカードをタップした場合：そのカードに遷移
      if (expandedCardId !== null) setExpandedCardId(null);
      
      setIsAnimating(true);
      setPrevCurrentIndex(currentIndex);
      setCurrentIndex(tappedScriptIndex);
    } else if (tappedScriptIndex === currentIndex) {
      // 中央のカードをタップした場合：解説文を表示/非表示
      setExpandedCardId(prevId => (prevId === id ? null : id));
    }
  };

  if (!scripts.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-800">
        Loading scripts...
      </div>
    );
  }

  const cardVariants = {
    behind: (customData: CardVariantCustomData) => ({ 
      y: -ITEM_HEIGHT_GUESS * 0.5, scale: PEEK_SCALE * 0.8, opacity: 0, zIndex: 0,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0.15 : 0.05 },
    }),
    prev: (customData: CardVariantCustomData) => ({ 
      y: 0, scale: PEEK_SCALE, opacity: customData.isExpanded ? 0.1 : PEEK_OPACITY, zIndex: 1,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0.1 : 0 },
    }),
    current: (customData: CardVariantCustomData) => ({ 
      y: ITEM_HEIGHT_GUESS * 0.7, 
      scale: customData.isExpanded ? 1.05 : 1, 
      opacity: 1, 
      zIndex: customData.isExpanded ? 20 : 10,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0 : 0.05 },
    }),
    next: (customData: CardVariantCustomData) => ({ 
      y: ITEM_HEIGHT_GUESS * 1.4, scale: PEEK_SCALE, opacity: customData.isExpanded ? 0.1 : PEEK_OPACITY, zIndex: 1,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0.1 : 0 },
    }),
    front: (customData: CardVariantCustomData) => ({ 
      y: ITEM_HEIGHT_GUESS * 1.9, scale: PEEK_SCALE * 0.8, opacity: 0, zIndex: 0,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0.15 : 0.05 },
    }),
    animatePrevToBehind: { 
      y: -ITEM_HEIGHT_GUESS * 0.5, scale: PEEK_SCALE * 0.8, opacity: 0, zIndex: 0,
    },
    animateCurrentToPrev: { 
      y: 0, scale: PEEK_SCALE, opacity: PEEK_OPACITY, zIndex: 1,
    },
    animateNextToCurrent: { 
      y: ITEM_HEIGHT_GUESS * 0.7, scale: 1, opacity: 1, zIndex: 10,
    },
    animateFrontToNext: { 
      y: ITEM_HEIGHT_GUESS * 1.4, scale: PEEK_SCALE, opacity: PEEK_OPACITY, zIndex: 1,
    },
    animateNextToFront: { 
      y: ITEM_HEIGHT_GUESS * 1.9, scale: PEEK_SCALE * 0.8, opacity: 0, zIndex: 0,
    },
    animateCurrentToNext: { 
      y: ITEM_HEIGHT_GUESS * 1.4, scale: PEEK_SCALE, opacity: PEEK_OPACITY, zIndex: 1,
    },
    animatePrevToCurrent: { 
      y: ITEM_HEIGHT_GUESS * 0.7, scale: 1, opacity: 1, zIndex: 10,
    },
    animateBehindToPrev: { 
      y: 0, scale: PEEK_SCALE, opacity: PEEK_OPACITY, zIndex: 1,
    },
    initial: (customData: CardVariantCustomData) => ({ 
      y: (customData.direction ?? 0) > 0 ? ITEM_HEIGHT_GUESS * 1.9 : -ITEM_HEIGHT_GUESS * 0.5,
      scale: PEEK_SCALE * 0.8,
      opacity: 0,
    }),
    exit: (customData: CardVariantCustomData) => ({ 
      y: (customData.direction ?? 0) > 0 ? -ITEM_HEIGHT_GUESS * 0.5 : ITEM_HEIGHT_GUESS * 1.9,
      scale: PEEK_SCALE * 0.8,
      opacity: 0,
      transition: { ...transitionSpec, delay: customData.isExpanded ? 0.15 : 0.05 }
    })
  };
  
  const getCardAnimationTarget = (scriptIdx: number) => {
    const scrollDirection = currentIndex - prevCurrentIndex;

    if (isAnimating) {
      if (scrollDirection > 0) { 
        if (scriptIdx === prevCurrentIndex - 1) return "animatePrevToBehind";
        if (scriptIdx === prevCurrentIndex) return "animateCurrentToPrev";
        if (scriptIdx === prevCurrentIndex + 1) return "animateNextToCurrent"; 
        if (scriptIdx === prevCurrentIndex + 2) return "animateFrontToNext"; 
        if (scriptIdx < prevCurrentIndex -1) return "behind";
        if (scriptIdx > prevCurrentIndex + 2) return "front";
      } else if (scrollDirection < 0) { 
        if (scriptIdx === prevCurrentIndex + 1) return "animateNextToFront";
        if (scriptIdx === prevCurrentIndex) return "animateCurrentToNext";
        if (scriptIdx === prevCurrentIndex - 1) return "animatePrevToCurrent"; 
        if (scriptIdx === prevCurrentIndex - 2) return "animateBehindToPrev"; 
        if (scriptIdx > prevCurrentIndex + 1) return "front";
        if (scriptIdx < prevCurrentIndex - 2) return "behind";
      }
    }

    if (scriptIdx === currentIndex - 1) return "prev";
    if (scriptIdx === currentIndex) return "current";
    if (scriptIdx === currentIndex + 1) return "next";
    if (scriptIdx < currentIndex - 1) return "behind";
    if (scriptIdx > currentIndex + 1) return "front";
    
    return "front"; 
  };

  const renderIndices = Array.from({ length: Math.min(scripts.length, 5) }, (_, i) => {
    let base = currentIndex - 2 + i;
    if (scripts.length <= 3) { 
        base = i;
    } else if (currentIndex < 2) {
        base = i;
    } else if (currentIndex > scripts.length - 3) {
        base = scripts.length - 5 + i;
    }
    return base;
  }).filter(idx => idx >= 0 && idx < scripts.length);
  
  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden relative select-none">
      <div className="flex-grow flex flex-col items-center justify-center w-full relative px-4">
        {/* Card container: Adjusted height to accommodate expanded cards */}
        <div className="relative w-full max-w-sm h-[600px] overflow-visible">
          <AnimatePresence initial={false} custom={{direction: currentIndex - prevCurrentIndex, isExpanded: !!expandedCardId}}>
            {renderIndices.map((scriptIdx) => {
              const script = scripts[scriptIdx];
              if (!script) return null; 

              const targetAnimation = getCardAnimationTarget(scriptIdx);
              const isCardExpanded = expandedCardId === script.id;
              const isCurrentDraggable = scriptIdx === currentIndex && !isCardExpanded && !isAnimating;

              return (
                <motion.div
                  key={script.id} 
                  className="absolute w-full"
                  variants={cardVariants}
                  initial="initial" 
                  animate={targetAnimation}
                  exit="exit" 
                  custom={{ 
                    isExpanded: isCardExpanded,
                    direction: currentIndex - prevCurrentIndex 
                  }}
                  transition={transitionSpec}
                  drag={isCurrentDraggable ? "y" : false}
                  dragConstraints={false}
                  dragElastic={0}
                  dragMomentum={false}
                  onDragEnd={isCurrentDraggable ? handleDragEnd : undefined}
                >
                  <Card
                    script={script}
                    isExpanded={isCardExpanded}
                    onToggleExpand={() => !isAnimating && handleCardTap(script.id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls Container - Adjusted margin and z-index */}
      <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-2 mb-4 z-30">
        <div className="flex justify-center gap-5">
          <button
            onClick={() => navigate(-1)}
            disabled={currentIndex === 0 || expandedCardId !== null || isAnimating}
            className={`p-3 rounded-full transition-all duration-200 ease-in-out
              bg-neumorph-bg text-neumorph-text shadow-neumorph-icon 
              hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed
              disabled:opacity-60 disabled:shadow-neumorph-icon disabled:cursor-not-allowed
            `}
            aria-label="Previous script"
          >
            <ChevronUpIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => navigate(1)}
            disabled={currentIndex === scripts.length - 1 || expandedCardId !== null || isAnimating}
            className={`p-3 rounded-full transition-all duration-200 ease-in-out
              bg-neumorph-bg text-neumorph-text shadow-neumorph-icon 
              hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed
              disabled:opacity-60 disabled:shadow-neumorph-icon disabled:cursor-not-allowed
            `}
            aria-label="Next script"
          >
            <ChevronDownIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="text-center text-sm text-gray-600 mt-3">
          {currentIndex + 1} / {scripts.length}
        </div>
      </div>
    </div>
  );
}
