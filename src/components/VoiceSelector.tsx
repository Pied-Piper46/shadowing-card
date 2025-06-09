'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { VoiceProvider } from '@/types';

interface VoiceSelectorProps {
  selectedVoice: VoiceProvider;
  onVoiceSelect: (voice: VoiceProvider) => void;
  onClose: () => void;
}

const voiceOptions: VoiceProvider[] = ['browser', 'google-us', 'google-uk', 'google-au'];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceSelect,
  onClose,
}) => {
  return (
    <div className="p-6 border-b border-neumorph-primary-dark/20">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-neumorph-text">
          Voice Selection
        </h3>
        <motion.button
          onClick={onClose}
          className="p-2 rounded-xl transition-all duration-200 ease-in-out
            bg-neumorph-bg text-neumorph-text shadow-neumorph-icon 
            hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {voiceOptions.map((voice, index) => {
          const isSelected = voice === selectedVoice;
          
          return (
            <motion.button
              key={voice}
              onClick={() => onVoiceSelect(voice)}
              className={`aspect-square rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center
                ${isSelected 
                  ? 'bg-neumorph-accent text-white shadow-neumorph-pressed' 
                  : 'bg-neumorph-bg text-neumorph-text shadow-neumorph-convex hover:shadow-neumorph-icon-hover'
                }
              `}
              whileHover={{ scale: isSelected ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Voice option ${index + 1}`}
            >
              <SpeakerWaveIcon className="h-5 w-5" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VoiceSelector;