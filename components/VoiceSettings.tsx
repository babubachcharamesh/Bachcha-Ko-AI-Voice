import React from 'react';
import { Speaker, LoadingStates, SpeakerAudioUrls } from '../types';
import SpeakerControl from './SpeakerControl';
import { DownloadIcon, SparklesIcon } from './icons';
import Loader from './Loader';

interface VoiceSettingsProps {
  speakers: Speaker[];
  speakerAudioUrls: SpeakerAudioUrls;
  loadingStates: LoadingStates;
  isGeneratingFullStory: boolean;
  fullStoryAudioUrl: string | null;
  onVoiceChange: (speakerId: string, newVoice: string) => void;
  onPreviewSpeaker: (speakerId: string) => void;
  onGenerateFullStory: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  speakers,
  speakerAudioUrls,
  loadingStates,
  isGeneratingFullStory,
  fullStoryAudioUrl,
  onVoiceChange,
  onPreviewSpeaker,
  onGenerateFullStory,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col h-full">
      <div className="space-y-4 flex-grow overflow-y-auto pr-2 max-h-[500px]">
        {speakers.length > 0 ? (
          speakers.map(speaker => (
            <SpeakerControl
              key={speaker.id}
              speaker={speaker}
              audioUrl={speakerAudioUrls[speaker.id]}
              isLoading={loadingStates[speaker.id] || false}
              onVoiceChange={onVoiceChange}
              onPreview={onPreviewSpeaker}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Speakers will appear here once you add a script.</p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">3. Generate & Download</h3>
        
        {fullStoryAudioUrl && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-400">Full Story Ready!</p>
              <p className="text-sm text-gray-400">Your audio narrative is complete.</p>
            </div>
            <div className="flex items-center space-x-2">
              <audio src={fullStoryAudioUrl} controls className="h-10 w-48 custom-audio-player"></audio>
               <a
                href={fullStoryAudioUrl}
                download={`Story_${new Date().toISOString().split('T')[0]}.wav`}
                className="p-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
                aria-label="Download Full Story"
              >
                <DownloadIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
        
        <button
          onClick={onGenerateFullStory}
          disabled={isGeneratingFullStory || speakers.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
        >
          {isGeneratingFullStory ? (
            <>
              <Loader />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Full Story Audio
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceSettings;
