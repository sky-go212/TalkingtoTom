import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, UserCog, UserX, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FABMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: UserPlus, label: 'Tambah', action: () => navigate('/contacts?action=add') },
    { icon: UserCog, label: 'Edit', action: () => navigate('/contacts?action=edit') },
    { icon: UserX, label: 'Hapus', action: () => navigate('/contacts?action=delete') },
    { icon: RefreshCw, label: 'Reset', action: () => navigate('/contacts?action=reset') },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { item.action(); setIsOpen(false); }}
                className="flex items-center gap-3 glass-strong rounded-xl px-4 py-3 w-full hover:bg-white/10"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full gradient-btn flex items-center justify-center glow-pink
                   ${isOpen ? 'rotate-45' : ''} transition-transform duration-200`}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default FABMenu;