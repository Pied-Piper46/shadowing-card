'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Card from '@/components/Card';
import Header from '@/components/Header';
import ScriptMenu from '@/components/ScriptMenu';
import { Script, VoiceProvider } from '@/types';
import { useScriptGroups } from '@/hooks/useScriptGroups';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import IconVolumeUp from '@/components/IconVolumeUp';
import IconVolumeOff from '@/components/IconVolumeOff';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const ITEM_HEIGHT_GUESS = 300;
const PEEK_SCALE = 0.85;
const PEEK_OPACITY = 0.5;
const DRAG_THRESHOLD_MODIFIED = 50;

const CURRENT_INDEX_STORAGE_KEY = 'shadowing-card-current-index';
const VOICE_SELECTION_STORAGE_KEY = 'shadowing-card-voice-selection';
const HOLD_DELAY = 500; // milliseconds before continuous scroll starts
const INITIAL_SCROLL_INTERVAL = 150; // initial milliseconds for continuous scroll step

// Speed acceleration stages
const ACCELERATION_STAGES = [
  { threshold: 0, interval: 150 },    // 0-2s: normal speed
  { threshold: 2000, interval: 100 }, // 2-4s: 1.5x speed  
  { threshold: 4000, interval: 60 },  // 4-6s: 2.5x speed
  { threshold: 6000, interval: 30 },  // 6s+: 5x speed
];

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
  const {
    scriptGroups,
    currentGroupId,
    currentScripts,
    selectGroup,
    getCurrentGroupTitle,
    getShortGroupTitle,
  } = useScriptGroups();
  const [selectedVoice, setSelectedVoice] = useState<VoiceProvider>('browser');
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevCurrentIndex, setPrevCurrentIndex] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  // Cleanup intervals and timeouts on component unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      if (holdStartTimeoutRef.current) {
        clearTimeout(holdStartTimeoutRef.current);
      }
    };
  }, []);

  // Load voice selection from localStorage
  useEffect(() => {
    const savedVoice = localStorage.getItem(VOICE_SELECTION_STORAGE_KEY);
    if (savedVoice && ['browser', 'google-us', 'google-uk', 'google-au'].includes(savedVoice)) {
      setSelectedVoice(savedVoice as VoiceProvider);
    }
  }, []);

  // Save voice selection to localStorage
  useEffect(() => {
    localStorage.setItem(VOICE_SELECTION_STORAGE_KEY, selectedVoice);
  }, [selectedVoice]);

  // Reset current index when scripts change (and load from storage)
  useEffect(() => {
    const savedIndexStr = localStorage.getItem(CURRENT_INDEX_STORAGE_KEY);
    let initialIndex = 0;
    if (savedIndexStr) {
      const savedIndex = parseInt(savedIndexStr, 10);
      if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < currentScripts.length) {
        initialIndex = savedIndex;
      }
    }
    setCurrentIndex(initialIndex);
    setExpandedCardId(null); // Always collapse card on script change/load
  }, [currentScripts]); // Depends on currentScripts to ensure index is valid

  // Save current index to localStorage
  useEffect(() => {
    if (currentScripts.length > 0) { // Only save if there are scripts
      localStorage.setItem(CURRENT_INDEX_STORAGE_KEY, currentIndex.toString());
    }
  }, [currentIndex, currentScripts]);

  const navigate = useCallback((direction: number) => {
    if (!currentScripts.length || isAnimating) return;

    setIsAnimating(true);
    setPrevCurrentIndex(currentIndex);

    if (expandedCardId !== null) {
      setExpandedCardId(null);
      setTimeout(() => {
        setCurrentIndex(prev => {
          const newIndex = prev + direction;
          if (newIndex >= 0 && newIndex < currentScripts.length) {
            return newIndex;
          }
          return prev;
        });
      }, 150); 
    } else {
      setCurrentIndex(prev => {
        const newIndex = prev + direction;
        if (newIndex >= 0 && newIndex < currentScripts.length) {
          return newIndex;
        }
        return prev;
      });
    }
  }, [currentScripts.length, currentIndex, expandedCardId, isAnimating]);

  // Get current scroll interval based on hold duration
  const getCurrentScrollInterval = useCallback(() => {
    if (!holdStartTimeRef.current) return INITIAL_SCROLL_INTERVAL;
    
    const elapsed = Date.now() - holdStartTimeRef.current;
    
    // Find the appropriate acceleration stage
    for (let i = ACCELERATION_STAGES.length - 1; i >= 0; i--) {
      if (elapsed >= ACCELERATION_STAGES[i].threshold) {
        return ACCELERATION_STAGES[i].interval;
      }
    }
    
    return INITIAL_SCROLL_INTERVAL;
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const animationDuration = (transitionSpec.stiffness > 0 ? 1000 / transitionSpec.stiffness : 0) * 5 + 300; 
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Update scroll interval dynamically based on hold duration
  const updateScrollInterval = useCallback((direction: number) => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    
    const currentInterval = getCurrentScrollInterval();
    scrollIntervalRef.current = setInterval(() => {
      navigate(direction);
      // Schedule next interval update
      updateScrollInterval(direction);
    }, currentInterval);
  }, [navigate, getCurrentScrollInterval]);

  const handlePressStart = useCallback((direction: number) => {
    if (holdStartTimeoutRef.current) clearTimeout(holdStartTimeoutRef.current);
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);

    // Record hold start time
    holdStartTimeRef.current = Date.now();

    holdStartTimeoutRef.current = setTimeout(() => {
      // Initial scroll after hold delay
      navigate(direction);
      // Start dynamic interval for continuous scroll
      updateScrollInterval(direction);
    }, HOLD_DELAY);
  }, [navigate, updateScrollInterval]);

  const handlePressEnd = useCallback(() => {
    if (holdStartTimeoutRef.current) {
      clearTimeout(holdStartTimeoutRef.current);
      holdStartTimeoutRef.current = null;
    }
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    // Reset hold start time
    holdStartTimeRef.current = null;
  }, []);

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

  const handleCardTap = (id: string) => {
    if (isAnimating) return;
    const tappedScriptIndex = currentScripts.findIndex((s: Script) => s.id === id);

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

  if (!currentScripts.length) {
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
      y: customData.isExpanded ? ITEM_HEIGHT_GUESS * 0.4 : ITEM_HEIGHT_GUESS * 0.7, // Adjusted y for expanded state
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

  const renderIndices = Array.from({ length: Math.min(currentScripts.length, 5) }, (_, i) => {
    let base = currentIndex - 2 + i;
    if (currentScripts.length <= 3) { 
        base = i;
    } else if (currentIndex < 2) {
        base = i;
    } else if (currentIndex > currentScripts.length - 3) {
        base = currentScripts.length - 5 + i;
    }
    return base;
  }).filter(idx => idx >= 0 && idx < currentScripts.length);
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative select-none">
      {/* Header */}
      <Header 
        currentGroupTitle={getCurrentGroupTitle()}
        shortGroupTitle={getShortGroupTitle()}
        onMenuClick={() => setIsMenuOpen(true)}
      />
      
      {/* Script Menu */}
      <ScriptMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        scriptGroups={scriptGroups}
        currentGroupId={currentGroupId}
        onGroupSelect={selectGroup}
        selectedVoice={selectedVoice}
        onVoiceSelect={setSelectedVoice}
      />

      <div className="flex-grow flex flex-col items-center justify-center w-full relative px-4">
        {/* Card container: Adjusted height to accommodate expanded cards */}
        <div className="relative w-full max-w-sm h-[600px] overflow-visible">
          <AnimatePresence initial={false} custom={{direction: currentIndex - prevCurrentIndex, isExpanded: !!expandedCardId}}>
            {renderIndices.map((scriptIdx) => {
              const script = currentScripts[scriptIdx];
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
                    selectedVoice={selectedVoice}
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
            onClick={() => navigate(-1)} // Handles single tap
            onMouseDown={() => handlePressStart(-1)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() => handlePressStart(-1)}
            onTouchEnd={handlePressEnd}
            disabled={currentIndex === 0 || isAnimating}
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
            onClick={() => {
              if (isSpeaking) cancel();
              if (currentScripts[currentIndex] && isSupported) {
                speak(currentScripts[currentIndex].englishText, selectedVoice);
              } else if (!isSupported) {
                alert('Sorry, your browser does not support text-to-speech.');
              }
            }}
            disabled={!currentScripts[currentIndex] || isAnimating}
            className={`p-3 rounded-full transition-all duration-200 ease-in-out
              ${isSpeaking 
                ? 'bg-neumorph-accent text-white shadow-neumorph-icon-pressed' 
                : 'bg-neumorph-bg text-neumorph-text shadow-neumorph-icon hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed'
              }
              disabled:opacity-60 disabled:shadow-neumorph-icon disabled:cursor-not-allowed
            `}
            aria-label={isSpeaking ? "Stop audio" : "Play audio"}
          >
            {isSpeaking ? <IconVolumeOff className="h-6 w-6" /> : <IconVolumeUp className="h-6 w-6" />}
          </button>
          <button
            onClick={() => navigate(1)} // Handles single tap
            onMouseDown={() => handlePressStart(1)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() => handlePressStart(1)}
            onTouchEnd={handlePressEnd}
            disabled={currentIndex === currentScripts.length - 1 || isAnimating}
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
          {currentIndex + 1} / {currentScripts.length}
        </div>
      </div>
    </div>
  );
}
