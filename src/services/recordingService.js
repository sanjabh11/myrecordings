import { supabase, STORAGE_BUCKET, MAX_FILE_SIZE } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const createRecording = async ({ blob, name, userId, anonymousId, sessionId }) => {
  try {
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 60MB limit');
    }

    let filePath = null;
    let fileUrl = null;

    // If user is authenticated, store in Supabase Storage
    if (userId) {
      const filename = `${userId}/${uuidv4()}.webm`;
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filename);

      filePath = filename;
      fileUrl = publicUrl;
    }

    // Create recording record
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        name,
        file_path: filePath,
        file_url: fileUrl,
        file_size: blob.size,
        user_id: userId,
        anonymous_id: anonymousId,
        session_id: sessionId,
        expires_at: userId ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for anonymous
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating recording:', error);
    throw error;
  }
};

export const deleteRecording = async (id, userId) => {
  try {
    const { data: recording, error: fetchError } = await supabase
      .from('recordings')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage if exists
    if (recording.file_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([recording.file_path]);

      if (storageError) throw storageError;
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
};

export const getUserRecordings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }
};