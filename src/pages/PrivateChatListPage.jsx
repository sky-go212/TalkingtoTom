import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../utils/api.js';

const PrivateChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [roomsData, contactsData] = await Promise.all([
        api.getChatRooms(),
        api.getContacts(),
      ]);
      setRooms(roomsData.rooms || []);
      setContacts(contactsData.contacts || []);
    } catch (e) { console.error('Load error:', e); }
  };

  const startChat = (contactCode) => {
    const room = rooms.find(r => 
      r.contact_a_code === contactCode || r.contact_b_code === contactCode
    );
    if (room) {
      navigate(`/private/${room.id}`);
    } else {
      navigate(`/private/new?contact=${contactCode}`);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.code !== user.code && 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="glass sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="p-2 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Chat Pribadi</h1>
        </div>
      </header>

      <div className="flex border-b border-white/10">
        <button onClick={() => navigate('/chat')} className="flex-1 py-3 text-text-muted text-sm">
          👥 Ruang Umum
        </button>
        <button className="flex-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm">
          💬 Chat Pribadi
        </button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kontak..."
            className="w-full input-glass pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        {filteredContacts.map((contact) => (
          <motion.button
            key={contact.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => startChat(contact.code)}
            className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{contact.name}</p>
              <p className="text-xs text-text-muted">{contact.code}</p>
            </div>
            <MessageCircle className="w-5 h-5 text-text-muted" />
          </motion.button>
        ))}

        {filteredContacts.length === 0 && (
          <div className="text-center py-10 text-text-muted">
            <p>Belum ada kontak</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChatListPage;