import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import PlaybackControls from '../components/recording/PlaybackControls';

const EmbedPlayer = () => {
  const { token } = useParams();
  const [recording, setRecording] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('share_token', token)
          .eq('is_public', true)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Recording not found');

        setRecording(data);

        const response = await fetch(data.public_url);
        if (!response.ok) throw new Error('Failed to fetch audio file');

        const blob = await response.blob();
        setAudioBlob(blob);
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError(err.message);
      }
    };

    if (token) {
      fetchRecording();
    }
  }, [token]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-50">
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white p-4">
      {audioBlob && (
        <PlaybackControls 
          audioBlob={audioBlob}
          showSaveButton={false}
          minimal={true}
        />
      )}
      <div className="mt-2 text-xs text-gray-500 text-right">
        <a 
          href={`${window.location.origin}/play/${token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-600"
        >
          Listen on RecordNow
        </a>
      </div>
    </div>
  );
};

export default EmbedPlayer;
