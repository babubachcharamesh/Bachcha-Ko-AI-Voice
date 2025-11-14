
export interface Speaker {
  id: string;
  name: string;
  dialogues: string[];
  voice: string;
}

export interface SpeakerAudio {
  speakerName: string;
  audioUrl: string | null;
  isLoading: boolean;
}

export type LoadingStates = {
  [speakerId: string]: boolean;
};
