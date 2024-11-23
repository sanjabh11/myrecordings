import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import PlaybackControls from '../components/recording/PlaybackControls';

const PlayRecording = () => {
  const { token } = useParams();
  const [recording, setRecording] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        // Fetch recording details
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('share_token', token)
          .eq('is_public', true)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Recording not found');

        setRecording(data);

        // Fetch audio file
        const response = await fetch(data.public_url);
        if (!response.ok) throw new Error('Failed to fetch audio file');

        const blob = await response.blob();
        setAudioBlob(blob);
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecording();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Recording Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">{recording.name}</h1>
          
          {audioBlob && (
            <PlaybackControls 
              audioBlob={audioBlob}
              showSaveButton={false}
            />
          )}

          <div className="mt-6 text-center text-gray-600">
            <p>Shared via RecordNow</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayRecording;
