// src/hooks/useRecordings.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useRecordings = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      if (user) {
        // Fetch authenticated user recordings from Supabase
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecordings(data || []);
      } else {
        // Fetch anonymous recordings from localStorage
        const storedRecordings = localStorage.getItem('anonymous_recordings');
        setRecordings(storedRecordings ? JSON.parse(storedRecordings) : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadRecording = async (blob, fileName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const filePath = `${user.id}/${fileName}`;
      const storage = getStorageClient();

      const { data, error: uploadError } = await storage
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = storage.getPublicUrl(filePath);

      // Add to tracks table
      const { data: track, error: dbError } = await supabase
        .from('tracks')
        .insert([{
          name: fileName,
          file_path: filePath,
          url: publicUrl,
          user_id: user.id
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setRecordings(prev => [track, ...prev]);
      return track;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const deleteRecording = async (id) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording) throw new Error('Recording not found');

      const storage = getStorageClient();
      
      // Delete from storage
      const { error: storageError } = await storage
        .remove([recording.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setRecordings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [user]);

  return {
    recordings,
    setRecordings,
    loading,
    error,
    fetchRecordings,
    uploadRecording,
    deleteRecording,
    user,
    isAuthenticated: !!user
  };
};
