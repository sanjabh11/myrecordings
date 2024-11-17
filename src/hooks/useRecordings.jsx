import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useAnonymousStorage } from './useAnonymousStorage';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const anonymousStorage = useAnonymousStorage();

  useEffect(() => {
    if (user) {
      fetchAuthenticatedRecordings();
    } else {
      setRecordings(anonymousStorage.recordings);
      setLoading(false);
    }
  }, [user]);

  const fetchAuthenticatedRecordings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRecordings(data || []);
    } catch (err) {
      setError('Failed to fetch recordings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRecording = async (blob, metadata = {}) => {
    if (user) {
      try {
        // Create a unique filename
        const timestamp = Date.now();
        const filename = `${user.id}/${timestamp}.webm`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(filename, blob, {
            contentType: 'audio/webm',
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('recordings')
          .getPublicUrl(filename);

        // Create record in database
        const { data, error: dbError } = await supabase
          .from('recordings')
          .insert([{
            user_id: user.id,
            file_path: filename,
            public_url: publicUrl,
            name: metadata.name || 'Untitled Recording',
            duration: metadata.duration || 0,
            size: blob.size,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // Update local state
        setRecordings(prev => [data, ...prev]);
        return data;
      } catch (err) {
        console.error('Error saving recording:', err);
        setError('Failed to save recording');
        throw err;
      }
    } else {
      return anonymousStorage.addRecording(blob, metadata);
    }
  };

  const deleteRecording = async (recordingId) => {
    if (user) {
      try {
        const recording = recordings.find(r => r.id === recordingId);
        if (!recording) return;

        // Delete from storage
        if (recording.file_path) {
          const { error: storageError } = await supabase.storage
            .from('recordings')
            .remove([recording.file_path]);

          if (storageError) throw storageError;
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('recordings')
          .delete()
          .eq('id', recordingId);

        if (dbError) throw dbError;

        setRecordings(prev => prev.filter(r => r.id !== recordingId));
      } catch (err) {
        setError('Failed to delete recording');
        throw err;
      }
    } else {
      return anonymousStorage.deleteRecording(recordingId);
    }
  };

  const getShareableLink = (recordingId) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (!recording || !user) return null;
    return recording.public_url;
  };

  return {
    recordings,
    loading,
    error,
    addRecording,
    deleteRecording,
    getShareableLink,
    isAuthenticated: !!user
  };
};