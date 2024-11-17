import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

const AudioEffects = ({ onApplyEffect }) => {
  const [selectedEffect, setSelectedEffect] = useState('');
  const [intensity, setIntensity] = useState(50);

  const effects = [
    { id: 'reverb', name: 'Reverb', description: 'Add space and depth' },
    { id: 'echo', name: 'Echo', description: 'Create repeating delays' },
    { id: 'pitch', name: 'Pitch Shift', description: 'Adjust voice pitch' },
    { id: 'compress', name: 'Compressor', description: 'Balance audio levels' }
  ];

  const handleApplyEffect = () => {
    if (selectedEffect && onApplyEffect) {
      onApplyEffect({
        type: selectedEffect,
        intensity: intensity / 100
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Audio Effects</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {effects.map(effect => (
          <button
            key={effect.id}
            onClick={() => setSelectedEffect(effect.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedEffect === effect.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-200'
            }`}
          >
            <div className="font-medium">{effect.name}</div>
            <div className="text-sm text-gray-500">{effect.description}</div>
          </button>
        ))}
      </div>

      {selectedEffect && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effect Intensity
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Subtle</span>
              <span>Strong</span>
            </div>
          </div>

          <button
            onClick={handleApplyEffect}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Apply {effects.find(e => e.id === selectedEffect)?.name}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioEffects;