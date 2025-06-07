'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Script } from '@/types';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import IconVolumeUp from '@/components/IconVolumeUp'; // Assuming SpeakerWaveIcon
import IconVolumeOff from '@/components/IconVolumeOff'; // Assuming SpeakerXMarkIcon or similar
import { InformationCircleIcon, LanguageIcon } from '@heroicons/react/24/outline';


interface CardProps {
  script: Script;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const MAX_CONTENT_HEIGHT = 200; // Define max height for content

const Card: React.FC<CardProps> = ({ script, isExpanded, onToggleExpand }) => {
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();
  const [needsScroll, setNeedsScroll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      // Use a timeout to allow layout to settle before measuring
      const timer = setTimeout(() => {
        if (contentRef.current) {
          setNeedsScroll(contentRef.current.scrollHeight > MAX_CONTENT_HEIGHT);
        }
      }, 50); // Adjust delay if needed, 50ms is a common starting point
      return () => clearTimeout(timer);
    } else {
      setNeedsScroll(false);
    }
  }, [isExpanded, script]); // Rerun if card expands or content changes

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card tap when clicking button
    if (isSpeaking) {
      cancel();
    } else if (isSupported) {
      speak(script.englishText);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const cardContentVariants = {
    collapsed: { opacity: 0, height: 0, y: -10 },
    expanded: { 
      opacity: 1, 
      height: 'auto', // Content will determine height, constrained by maxHeight in style
      y: 0, 
      transition: { duration: 0.3, ease: "easeInOut" } 
    },
  };

  return (
    <motion.div
      layout // Enables smooth animation of size and position changes
      onClick={onToggleExpand}
      className={`
        w-full p-6 rounded-3xl cursor-pointer relative
        transition-shadow duration-300 ease-in-out
        bg-neumorph-bg shadow-neumorph-convex
        ${isExpanded ? 'z-40' : ''}
      `}
      style={{
        // Ensure expanded card is on top if it's part of a list flow
        // For absolute positioning in page.tsx, zIndex on the wrapper is more effective
      }}
      initial={false} // No initial animation for layout changes on first render
      animate={{ 
        scale: isExpanded ? 1 : 1, // No expansion, rely on container padding
      }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-start mb-4">
        <button
          onClick={handlePlayAudio}
          className={`p-3 rounded-full transition-all duration-200 ease-in-out mr-4 flex-shrink-0
            ${isSpeaking 
              ? 'bg-neumorph-accent text-white shadow-neumorph-icon-pressed' 
              : 'bg-neumorph-bg text-neumorph-text shadow-neumorph-icon hover:bg-gray-300 active:shadow-neumorph-icon-pressed'
            }
          `}
          aria-label={isSpeaking ? "Stop audio" : "Play audio"}
        >
          {isSpeaking ? <IconVolumeOff className="h-6 w-6" /> : <IconVolumeUp className="h-6 w-6" />}
        </button>
        <div className="flex-grow">
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl font-semibold text-neumorph-text leading-tight"
            animate={{ color: isSpeaking ? '#5a99d4' : '#374151' }}
          >
            {script.englishText}
          </motion.p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="details" // Keep one key
            ref={contentRef} // Keep ref
            variants={cardContentVariants} // Keep one variants
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className={needsScroll ? "overflow-y-auto" : "overflow-hidden"} // Use needsScroll state
            style={{ maxHeight: isExpanded ? `${MAX_CONTENT_HEIGHT}px` : '0px' }} // Use constant for maxHeight
          >
            <div className="mt-4 pt-4 border-t border-neumorph-primary-dark/30">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-neumorph-text/70 mb-1 flex items-center">
                  <LanguageIcon className="h-4 w-4 mr-2 text-neumorph-accent" />
                  日本語訳
                </h3>
                <p className="text-neumorph-text/90 text-sm">{script.japaneseTranslation}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neumorph-text/70 mb-1 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2 text-neumorph-accent" />
                  解説
                </h3>
                <p className="text-neumorph-text/90 text-sm">{script.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Card;
