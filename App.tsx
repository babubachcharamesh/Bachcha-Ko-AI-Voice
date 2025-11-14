import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Speaker, LoadingStates, SpeakerAudioUrls } from './types';
import { AVAILABLE_VOICES } from './constants';
import ScriptInput from './components/ScriptInput';
import VoiceSettings from './components/VoiceSettings';
import { generateSingleSpeakerSpeech, generateMultiSpeakerSpeech } from './services/geminiService';
import { createAudioBlobUrl } from './utils/audioUtils';

const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [speakerAudioUrls, setSpeakerAudioUrls] = useState<SpeakerAudioUrls>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [isGeneratingFullStory, setIsGeneratingFullStory] = useState<boolean>(false);
  const [fullStoryAudioUrl, setFullStoryAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedScript = localStorage.getItem('bachcha-ko-ai-voice-script');
    if (savedScript) {
      setScript(savedScript);
    }
  }, []);

  const parseScript = useCallback((text: string) => {
    const speakerMap = new Map<string, { dialogues: string[]; voice: string }>();
    const lines = text.split('\n');
    const speakerPattern = /^(?:\[)?([^:]+):\s*\]?(.*)$/;

    lines.forEach(line => {
      const match = line.trim().match(speakerPattern);
      if (match) {
        const speakerName = match[1].trim();
        const dialogue = match[2].trim();
        if (dialogue) {
          if (!speakerMap.has(speakerName)) {
            const existingSpeaker = speakers.find(s => s.name === speakerName);
            speakerMap.set(speakerName, {
              dialogues: [],
              voice: existingSpeaker?.voice || AVAILABLE_VOICES[speakerMap.size % AVAILABLE_VOICES.length],
            });
          }
          speakerMap.get(speakerName)!.dialogues.push(dialogue);
        }
      }
    });

    const newSpeakers: Speaker[] = Array.from(speakerMap.entries()).map(([name, data], index) => ({
      id: name.replace(/\s+/g, '-').toLowerCase() || `speaker-${index}`,
      name,
      ...data,
    }));
    
    setSpeakers(newSpeakers);
  }, [speakers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      parseScript(script);
      localStorage.setItem('bachcha-ko-ai-voice-script', script);
    }, 500); // Debounce parsing
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  const handleVoiceChange = (speakerId: string, newVoice: string) => {
    setSpeakers(prev =>
      prev.map(s => (s.id === speakerId ? { ...s, voice: newVoice } : s))
    );
    // Invalidate the generated audio for this speaker as the voice has changed
    setSpeakerAudioUrls(prev => ({ ...prev, [speakerId]: null }));
  };
  
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handlePreviewSpeaker = async (speakerId: string) => {
    const speaker = speakers.find(s => s.id === speakerId);
    if (!speaker) return;

    setLoadingStates(prev => ({ ...prev, [speakerId]: true }));
    setError(null);

    try {
      const fullDialogue = speaker.dialogues.join(' ');
      const base64Audio = await generateSingleSpeakerSpeech(fullDialogue, speaker.voice);
      if (base64Audio) {
        const url = await createAudioBlobUrl(base64Audio);
        setSpeakerAudioUrls(prev => ({ ...prev, [speakerId]: url }));
        playAudio(url);
      } else {
        throw new Error('No audio data received.');
      }
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate audio preview. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [speakerId]: false }));
    }
  };
  
  const handleGenerateFullStory = async () => {
    if (speakers.length === 0) {
      setError("Script is empty or no speakers detected.");
      return;
    }
    
    setIsGeneratingFullStory(true);
    setFullStoryAudioUrl(null);
    setError(null);

    try {
      const base64Audio = await generateMultiSpeakerSpeech(speakers);
      if (base64Audio) {
        const url = await createAudioBlobUrl(base64Audio);
        setFullStoryAudioUrl(url);
      } else {
        throw new Error('No audio data received for the full story.');
      }
    } catch (err) {
      console.error('Error generating full story:', err);
      setError('Failed to generate full story audio. Please try again.');
    } finally {
      setIsGeneratingFullStory(false);
    }
  };

  const MemoizedScriptInput = useMemo(() => <ScriptInput script={script} onScriptChange={setScript} />, [script]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Bachcha Ko AI Voice
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Turn your stories into captivating audio narratives.
          </p>
        </header>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-200">1. Your Story Script</h2>
            {MemoizedScriptInput}
          </div>
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-200">2. Voice Settings</h2>
            <VoiceSettings
              speakers={speakers}
              speakerAudioUrls={speakerAudioUrls}
              loadingStates={loadingStates}
              isGeneratingFullStory={isGeneratingFullStory}
              fullStoryAudioUrl={fullStoryAudioUrl}
              onVoiceChange={handleVoiceChange}
              onPreviewSpeaker={handlePreviewSpeaker}
              onGenerateFullStory={handleGenerateFullStory}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
