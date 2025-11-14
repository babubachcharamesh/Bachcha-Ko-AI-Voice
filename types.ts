export interface Speaker {
  id: string;
  name: string;
  dialogues: string[];
  voice: string;
}

export type LoadingStates = {
  [speakerId: string]: boolean;
};

export type SpeakerAudioUrls = {
  [key: string]: string | null;
};
