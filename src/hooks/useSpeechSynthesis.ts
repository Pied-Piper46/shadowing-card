import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceProvider } from '@/types';

interface SpeechSynthesisOptions {
  onEnd?: () => void;
  lang?: string;
  voice?: SpeechSynthesisVoice | null;
  voiceProvider?: VoiceProvider;
}

export const useSpeechSynthesis = (options?: SpeechSynthesisOptions) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      // Initialize utteranceRef here or when speak is called
    }
  }, []);

  const speakWithBrowser = useCallback((text: string) => {
    if (!isSupported || !text || isSpeaking) return;

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'en-US';
    if (options?.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (options?.onEnd) {
        options.onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking, options]);

  const speakWithGoogle = useCallback(async (text: string, voiceProvider: VoiceProvider) => {
    if (!text || isSpeaking) return;

    setIsSpeaking(true);

    try {
      // Map voice provider to Google Cloud TTS configuration
      const voiceConfig = {
        'google-us': { languageCode: 'en-AU', name: 'en-AU-Chirp-HD-D' },
        'google-uk': { languageCode: 'en-GB', name: 'en-GB-Chirp3-HD-Aoede' },
        'google-au': { languageCode: 'en-US', name: 'en-US-Chirp-HD-F' },
      }[voiceProvider as Exclude<VoiceProvider, 'browser'>];

      if (!voiceConfig) {
        throw new Error('Invalid voice provider');
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: voiceConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (options?.onEnd) {
          options.onEnd();
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error');
      };

      await audio.play();
    } catch (error) {
      console.error('Google TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowser(text);
    }
  }, [isSpeaking, options, speakWithBrowser]);

  const speak = useCallback((text: string, voiceProvider: VoiceProvider = 'browser') => {
    if (voiceProvider === 'browser') {
      speakWithBrowser(text);
    } else {
      speakWithGoogle(text, voiceProvider);
    }
  }, [speakWithBrowser, speakWithGoogle]);

  const cancel = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, cancel, isSpeaking, isSupported };
};