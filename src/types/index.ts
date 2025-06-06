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
    [key: string]: any;
  };
  scriptIds: string[];
  description?: string;
}
