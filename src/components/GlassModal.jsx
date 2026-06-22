import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassModal = ({ children, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass-strong rounded-2xl w-full max-w-md overflow-hidden"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlassModal;