import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Image, MoreVertical, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useWebSocket } from '../contexts/WebSocketContext.jsx';
import ChatBubble from '../components/ChatBubble.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import FABMenu from '../components/FABMenu.jsx';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import * as api from '../utils/api.js';

const GroupChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected, messages, typingUsers, sendGroupMessage, setTyping, clearMessages } = useWebSocket();
  const [inputText, setInputText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadMessages();
    return () => clearMessages();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages]);

  const loadMessages = async () => {
    try {
      const data = await api.getGroupMessages();
      setLocalMessages(data.messages || []);
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
    sendGroupMessage(inputText.trim());
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
      sendGroupMessage(null, url, 'image');
    } catch (err) { console.error('Upload error:', err); }
  };

  const allMessages = [...localMessages, ...messages];
  const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id || m.timestamp, m])).values());

  if (!user) return null;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/private')} className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-text-muted" />
            </button>
            <div>
              <h1 className="font-bold text-lg">Ruang Umum</h1>
              <div className="flex items-center gap-1 text-xs text-success">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-error'}`} />
                <span>{connected ? 'Online' : 'Connecting...'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/contacts')} className="p-2 glass rounded-lg hover:bg-white/10">
              <Users className="w-5 h-5" />
            </button>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 glass rounded-lg hover:bg-white/10 relative">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10">
        <button className="flex-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm">
          👥 Ruang Umum
        </button>
        <button onClick={() => navigate('/private')} className="flex-1 py-3 text-text-muted text-sm">
          💬 Chat Pribadi
        </button>
      </div>

      {/* Messages */}
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

      {/* Input Bar */}
      <div className="glass p-3 pb-safe">
        {showRecorder ? (
          <VoiceRecorder 
            onCancel={() => setShowRecorder(false)}
            onSend={(audioUrl) => { sendGroupMessage(null, audioUrl, 'voice'); setShowRecorder(false); }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRecorder(true)} className="p-3 glass rounded-xl text-primary hover:bg-white/10">
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
            <button onClick={() => fileInputRef.current?.click()} className="p-3 glass rounded-xl text-primary hover:bg-white/10">
              <Image className="w-5 h-5" />
            </button>
            <button onClick={handleSend} disabled={!inputText.trim()}
                    className="p-3 gradient-btn rounded-xl disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* FAB - Admin only */}
      {user.isAdmin && <FABMenu />}

      {/* Menu Dropdown */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-16 right-4 glass-strong rounded-xl p-2 z-50 min-w-[180px]"
          >
            <button onClick={() => { navigate('/settings'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 text-sm">
              Settings
            </button>
            <button onClick={() => { logout(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 text-error text-sm">
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupChatPage;