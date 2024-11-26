import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import RecordingInterface from '../components/recording/RecordingInterface';

const RecordPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const MAX_RECORDING_TIME = 120; // 120 seconds = 2 minutes

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Record Your Song
          </h1>

          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Tips
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Find a quiet place to record</li>
              <li>• Keep your microphone close to your mouth</li>
              <li>• You have up to 2 minutes for your recording</li>
              <li>• Click the microphone icon to start recording</li>
            </ul>
          </div>

          {/* Recording Interface */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <RecordingInterface
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              recordingTime={recordingTime}
              setRecordingTime={setRecordingTime}
              maxRecordingTime={MAX_RECORDING_TIME}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecordPage;
