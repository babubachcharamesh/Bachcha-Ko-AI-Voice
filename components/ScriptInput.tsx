
import React from 'react';
import { SCRIPT_PLACEHOLDER } from '../constants';

interface ScriptInputProps {
  script: string;
  onScriptChange: (value: string) => void;
}

const ScriptInput: React.FC<ScriptInputProps> = ({ script, onScriptChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder={SCRIPT_PLACEHOLDER}
        className="w-full h-full flex-grow bg-gray-900 text-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none min-h-[400px] lg:min-h-[600px] text-base leading-relaxed"
      />
    </div>
  );
};

export default ScriptInput;
