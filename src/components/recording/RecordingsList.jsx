import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storageHelpers, supabase } from '../../services/supabaseClient';
import styles from './RecordingsList.module.css';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShare, FaPlay, FaPause, FaEdit } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';

const RecordingsList = ({ recordings, onDelete, getRecordingBlob, error }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Cleanup audio elements when component unmounts
    return () => {
      Object.values(audioElements).forEach(audio => {
        if (audio) {
          audio.pause();
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, [audioElements]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handlePlay = async (e, recording) => {
    e.preventDefault();
    try {
      if (playingId === recording.id) {
        // Stop playing
        if (audioElements[recording.id]) {
          audioElements[recording.id].pause();
          audioElements[recording.id].currentTime = 0;
        }
        setPlayingId(null);
        return;
      }

      // Stop any currently playing audio
      if (playingId && audioElements[playingId]) {
        audioElements[playingId].pause();
        audioElements[playingId].currentTime = 0;
      }

      let audio = audioElements[recording.id];
      
      if (!audio) {
        const blob = await getRecordingBlob(recording.id);
        const url = URL.createObjectURL(blob);
        audio = new Audio(url);
        audio.onended = () => {
          setPlayingId(null);
        };
        setAudioElements(prev => ({
          ...prev,
          [recording.id]: audio
        }));
      }

      audio.play();
      setPlayingId(recording.id);
    } catch (error) {
      console.error('Error playing recording:', error);
      alert('Failed to play recording. Please try again.');
    }
  };

  const handleShare = async (recording) => {
    if (!user) {
      alert('Please sign in to share recordings.');
      return;
    }

    try {
      // First upload the recording to Supabase
      const blob = await getRecordingBlob(recording.id);
      const { publicUrl } = await storageHelpers.uploadRecording(blob, recording.id, user.id);
      
      // Generate share link
      const shareLink = storageHelpers.generateShareLink(user.id, recording.id);
      setShareUrl(shareLink);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleDelete = async (recordingId) => {
    try {
      // Stop playing if this recording is being played
      if (playingId === recordingId && audioElements[recordingId]) {
        audioElements[recordingId].pause();
        URL.revokeObjectURL(audioElements[recordingId].src);
        setPlayingId(null);
      }

      // Remove audio element
      setAudioElements(prev => {
        const newElements = { ...prev };
        delete newElements[recordingId];
        return newElements;
      });

      await onDelete(recordingId);
    } catch (error) {
      console.error('Error deleting recording:', error);
      alert('Failed to delete recording. Please try again.');
    }
  };

  const handleRename = async (recording) => {
    setEditingId(recording.id);
    setEditName(recording.name);
  };

  const handleSaveRename = async (recording) => {
    try {
      if (!editName.trim()) {
        alert('Please enter a valid name');
        return;
      }

      const { error: updateError } = await supabase
        .from('recordings')
        .update({ name: editName.trim() })
        .eq('id', recording.id);

      if (updateError) throw updateError;

      // Update local state
      recording.name = editName.trim();
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Error renaming recording:', error);
      alert('Failed to rename recording. Please try again.');
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please try manually selecting and copying.');
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this recording on Sing-A-Song!\n${shareUrl}`);
    window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.recordingsList}>
      {recordings.length === 0 ? (
        <p className={styles.noRecordings}>No recordings yet</p>
      ) : (
        recordings.map((recording) => (
          <div key={recording.id} className={styles.recordingItem}>
            <div className={styles.recordingInfo}>
              {editingId === recording.id ? (
                <div className={styles.recordingName}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(recording);
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button onClick={() => handleSaveRename(recording)}>Save</button>
                    <button onClick={handleCancelRename}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={styles.recordingName}>
                  {recording.name}
                </div>
              )}
              <div className={styles.recordingMeta}>
                Created: {formatDate(recording.createdAt)}
              </div>
            </div>
            
            <div className={styles.recordingActions}>
              <button
                className={`${styles.actionButton} ${styles.playButton} ${playingId === recording.id ? styles.playing : ''}`}
                onClick={(e) => handlePlay(e, recording)}
              >
                {playingId === recording.id ? <FaPause /> : <FaPlay />}
              </button>

              {editingId !== recording.id && (
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleRename(recording)}
                >
                  <FaEdit />
                  <span>Rename</span>
                </button>
              )}

              {user && editingId !== recording.id && (
                <button
                  className={`${styles.actionButton} ${styles.shareButton}`}
                  onClick={() => handleShare(recording)}
                >
                  <FaShare />
                  <span>Share</span>
                </button>
              )}

              {editingId !== recording.id && (
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(recording.id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {showShareModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.shareModal}>
            <h3>Share Recording</h3>
            <div className={styles.shareOptions}>
              <div className={styles.shareLink}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                />
                <button onClick={copyToClipboard}>
                  <MdContentCopy />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className={styles.socialShare}>
                <button 
                  className={styles.shareButton}
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this recording on Sing-A-Song!')}`, '_blank')
                }
                >
                  <FaTwitter /> Share on Twitter
                </button>
                <button 
                  className={styles.shareButton}
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
                }
                >
                  <FaFacebook /> Share on Facebook
                </button>
                <button 
                  className={styles.shareButton}
                  onClick={shareOnWhatsApp}
                >
                  <FaWhatsapp /> Share on WhatsApp
                </button>
              </div>
            </div>
            <button 
              className={styles.closeButton}
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingsList;