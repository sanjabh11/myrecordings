import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import useAnonymousStorage from './useAnonymousStorage';

export const useRecordings = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const anonymousStorage = useAnonymousStorage();

  useEffect(() => {
    fetchRecordings();
  }, [user]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      if (user) {
        // Fetch authenticated user recordings from Supabase
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecordings(data || []);
      } else {
        // Use anonymous storage for unauthenticated users
        setRecordings(anonymousStorage.recordings);
      }
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecording = async (blob, metadata = {}) => {
    try {
      if (user) {
        // Upload to Supabase for authenticated users
        const fileName = `recording_${Date.now()}.webm`;
        const filePath = `${user.id}/${fileName}`;
        const storage = supabase.storage.from('tracks');

        const { data, error: uploadError } = await storage
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = storage.getPublicUrl(filePath);

        const { data: recording, error: dbError } = await supabase
          .from('recordings')
          .insert([{
            name: fileName,
            file_path: filePath,
            public_url: publicUrl,
            user_id: user.id,
            is_public: true,
            share_token: crypto.randomUUID()
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        setRecordings(prev => [recording, ...prev]);
        return recording;
      } else {
        // Use anonymous storage for unauthenticated users
        const recording = await anonymousStorage.addRecording(blob, metadata);
        setRecordings(anonymousStorage.recordings);
        return recording;
      }
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const deleteRecording = async (recordingId) => {
    try {
      if (user) {
        // Delete from Supabase for authenticated users
        const recording = recordings.find(r => r.id === recordingId);
        if (!recording) throw new Error('Recording not found');

        const storage = supabase.storage.from('tracks');
        
        // Delete from storage
        const { error: storageError } = await storage
          .remove([recording.file_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('recordings')
          .delete()
          .eq('id', recordingId);

        if (dbError) throw dbError;

        setRecordings(prev => prev.filter(r => r.id !== recordingId));
      } else {
        // Use anonymous storage for unauthenticated users
        await anonymousStorage.deleteRecording(recordingId);
        setRecordings(anonymousStorage.recordings);
      }
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  const updateRecording = async (id, updates) => {
    try {
      if (user) {
        // Update in Supabase for authenticated users
        const { error } = await supabase
          .from('recordings')
          .update(updates)
          .eq('id', id);

        if (error) throw error;

        setRecordings(prevRecordings =>
          prevRecordings.map(recording =>
            recording.id === id ? { ...recording, ...updates } : recording
          )
        );
      } else {
        // Anonymous users can't update recordings
        throw new Error('Please sign in to update recordings');
      }
    } catch (error) {
      console.error('Error updating recording:', error);
      throw error;
    }
  };

  return {
    recordings,
    loading,
    error,
    addRecording,
    deleteRecording,
    updateRecording,
    fetchRecordings
  };
};

export default useRecordings;
