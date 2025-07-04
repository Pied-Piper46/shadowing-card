export interface Script {
  id: string;
  englishText: string;
  japaneseTranslation: string;
  explanation: string;
}

export interface ScriptGroup {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  details?: {
    [key: string]: string | number | boolean | null;
  };
  // scriptIds: string[]; // Removed as scripts will be loaded by group ID
  description?: string;
}

export type VoiceProvider = 'browser' | 'google-us' | 'google-uk' | 'google-au';

export interface VoiceOption {
  id: VoiceProvider;
  name: string;
  type: 'browser' | 'google';
  config?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
  };
}
