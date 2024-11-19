// src/components/recording/RecordingUpload.jsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useRecordings } from '../../hooks/useRecordings';

const RecordingUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { addRecording } = useRecordings();

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Create file path
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath);

      // Add record to tracks table
      await addRecording({
        name: file.name,
        file_path: filePath,
        url: publicUrl
      });

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default RecordingUpload;