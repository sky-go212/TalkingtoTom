import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

const VoiceRecorder = ({ onCancel, onSend }) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const handleSend = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      onSend(url);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 w-full">
      {recording ? (
        <>
          <div className="flex-1 flex items-center gap-3 glass rounded-xl px-4 py-3">
            <div className="w-3 h-3 bg-error rounded-full animate-pulse" />
            <span className="text-sm font-mono">{formatTime(duration)}</span>
            <div className="flex-1 h-8 flex items-end gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{ height: [4, 16 + Math.random() * 16, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>
          <button onClick={stopRecording} className="p-3 bg-error rounded-xl text-white">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </button>
        </>
      ) : (
        <>
          <button onClick={onCancel} className="p-3 glass rounded-xl text-text-muted hover:text-error">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 glass rounded-xl px-4 py-3 text-sm text-text-muted">
            Voice message ready
          </div>
          <button onClick={handleSend} className="p-3 gradient-btn rounded-xl">
            <Send className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;