
import { GoogleGenAI, Modality } from "@google/genai";
import type { Speaker } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

export const generateSingleSpeakerSpeech = async (text: string, voice: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error in generateSingleSpeakerSpeech:", error);
    throw new Error("Failed to generate speech from API.");
  }
};

export const generateMultiSpeakerSpeech = async (speakers: Speaker[]): Promise<string | null> => {
  if (speakers.length < 2) {
    if (speakers.length === 1) {
      const singleSpeaker = speakers[0];
      const fullDialogue = singleSpeaker.dialogues.join(' ');
      return generateSingleSpeakerSpeech(fullDialogue, singleSpeaker.voice);
    }
    return null;
  }

  try {
    const speakerNames = speakers.map(s => s.name).join(' and ');
    let fullScript = `TTS the following conversation between ${speakerNames}:\n`;
    
    // This part constructs the script in a way Gemini understands for multi-speaker
    const scriptLines: string[] = [];
    let lastSpeaker: string | null = null;
    
    speakers.forEach(speaker => {
      speaker.dialogues.forEach(dialogue => {
         scriptLines.push(`${speaker.name}: ${dialogue}`);
      });
    });
    fullScript += scriptLines.join('\n');


    const speakerVoiceConfigs = speakers.map(s => ({
      speaker: s.name,
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: s.voice }
      }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: speakerVoiceConfigs
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error in generateMultiSpeakerSpeech:", error);
    throw new Error("Failed to generate multi-speaker speech from API.");
  }
};
