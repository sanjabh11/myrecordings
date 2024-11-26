import React, { useState } from 'react';
import { FaMicrophone, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const RecordingGuide = ({ hasPermission, onClose }) => {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: 'Welcome to RecordNow!',
      content: 'Follow these quick steps to start recording your voice.',
      icon: <FaMicrophone className="text-primary text-2xl" />
    },
    {
      title: 'Microphone Access',
      content: hasPermission 
        ? "Great! Microphone access granted. You are ready to record."
        : "Please allow microphone access when prompted to start recording.",
      icon: hasPermission 
        ? <FaCheckCircle className="text-green-500 text-2xl" />
        : <FaMicrophone className="text-primary text-2xl" />
    },
    {
      title: 'Recording Tips',
      content: 'Click the microphone button to start. You have up to 2 minutes per recording.',
      icon: <FaInfoCircle className="text-primary text-2xl" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="recording-guide bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {steps[step - 1].icon}
          <h3 className="text-xl font-semibold">{steps[step - 1].title}</h3>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <p className="text-gray-600 mb-6">{steps[step - 1].content}</p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index + 1 === step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {step === steps.length ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default RecordingGuide;
