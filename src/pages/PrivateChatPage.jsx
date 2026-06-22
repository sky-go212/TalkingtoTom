import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Mic, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useWebSocket } from '../contexts/WebSocketContext.jsx';
import ChatBubble from '../components/ChatBubble.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import * as api from '../utils/api.js';

const PrivateChatPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  const { connected, messages, typingUsers, sendPrivateMessage, setTyping, clearMessages } = useWebSocket();
  const [inputText, setInputText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [contactName, setContactName] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadMessages();
    return () => clearMessages();
  }, [user, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages]);

  const loadMessages = async () => {
    try {
      const data = await api.getPrivateMessages(roomId);
      setLocalMessages(data.messages || []);
      if (data.messages?.length > 0) {
        const otherMsg = data.messages.find(m => m.sender_code !== user.code);
        if (otherMsg) setContactName(otherMsg.sender_name || 'Unknown');
      }
    } catch (e) { console.error('Load messages error:', e); }
  };

  const handleInputChange = (value) => {
    setInputText(value);
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendPrivateMessage(roomId, inputText.trim());
    setInputText('');
    setTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await api.uploadMedia(file);
      sendPrivateMessage(roomId, null, url, 'image');
    } catch (err) { console.error('Upload error:', err); }
  };

  const allMessages = [...localMessages, ...messages.filter(m => m.roomId === roomId)];
  const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id || m.timestamp, m])).values());

  if (!user) return null;

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="glass sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/private')} className="p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">{contactName || 'Chat Pribadi'}</h1>
              <div className="flex items-center gap-1 text-xs text-success">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-error'}`} />
                <span>{connected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <AnimatePresence>
          {uniqueMessages.map((msg, index) => (
            <ChatBubble key={msg.id || `msg-${index}`} message={msg} isOwn={msg.senderCode === user.code} />
          ))}
        </AnimatePresence>

        {Object.entries(typingUsers)
          .filter(([code, isTyping]) => isTyping && code !== user.code)
          .map(([code]) => <TypingIndicator key={code} contactCode={code} />)}

        <div ref={messagesEndRef} />
      </div>

      <div className="glass p-3 pb-safe">
        {showRecorder ? (
          <VoiceRecorder 
            onCancel={() => setShowRecorder(false)}
            onSend={(audioUrl) => { sendPrivateMessage(roomId, null, audioUrl, 'voice'); setShowRecorder(false); }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRecorder(true)} className="p-3 glass rounded-xl text-primary">
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tulis pesan..."
              className="flex-1 input-glass text-sm"
            />
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 glass rounded-xl text-primary">
              <Image className="w-5 h-5" />
            </button>
            <button onClick={handleSend} disabled={!inputText.trim()} className="p-3 gradient-btn rounded-xl disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChatPage;