import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const uploadRecording = async (blob, userId) => {
  try {
    const filename = `${userId}/${uuidv4()}.webm`;
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(filename, blob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(filename);

    return { path: filename, url: publicUrl };
  } catch (error) {
    console.error('Error uploading recording:', error);
    throw error;
  }
};

export const deleteRecording = async (path) => {
  try {
    const { error } = await supabase.storage
      .from('recordings')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
};