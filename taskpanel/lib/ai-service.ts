// AI service to replace Puter AI functionality
export interface AIService {
  chat: (prompt: string, options?: any) => Promise<string>;
  txt2speech: (text: string) => Promise<HTMLAudioElement>;
}

class LocalAIService implements AIService {
  async chat(prompt: string, options?: any): Promise<string> {
    console.warn('AI chat not implemented - using mock response');
    return 'AI response placeholder - Please implement actual AI service';
  }

  async txt2speech(text: string): Promise<HTMLAudioElement> {
    console.warn('Text-to-speech not implemented - using system speech synthesis');
    const audio = new Audio();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
    return audio;
  }
}

export const aiService = new LocalAIService();