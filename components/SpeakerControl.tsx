
import React from 'react';
import { Speaker } from '../types';
import { AVAILABLE_VOICES } from '../constants';
import { PlayIcon, VolumeUpIcon } from './icons';
import Loader from './Loader';

interface SpeakerControlProps {
  speaker: Speaker;
  isLoading: boolean;
  onVoiceChange: (speakerId: string, newVoice: string) => void;
  onPreview: (speakerId: string) => void;
}

const SpeakerControl: React.FC<SpeakerControlProps> = ({
  speaker,
  isLoading,
  onVoiceChange,
  onPreview,
}) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-grow">
        <div className="flex items-center mb-2">
            <VolumeUpIcon className="w-5 h-5 mr-2 text-purple-400" />
            <p className="font-bold text-lg text-white">{speaker.name}</p>
        </div>
        <p className="text-sm text-gray-400 italic truncate">
          "{speaker.dialogues[0]}"
          {speaker.dialogues.length > 1 ? '...' : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:w-auto w-full">
        <select
          value={speaker.voice}
          onChange={(e) => onVoiceChange(speaker.id, e.target.value)}
          className="bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none flex-grow"
        >
          {AVAILABLE_VOICES.map(voice => (
            <option key={voice} value={voice}>
              {voice}
            </option>
          ))}
        </select>
        <button
          onClick={() => onPreview(speaker.id)}
          disabled={isLoading}
          className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
          aria-label={`Preview voice for ${speaker.name}`}
        >
          {isLoading ? <Loader small /> : <PlayIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default SpeakerControl;
