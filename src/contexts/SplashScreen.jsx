import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
      {/* Background gradient blurs */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-secondary/15 rounded-full blur-[100px]" />

      {/* Logo with glow - NO TEXT */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/30 blur-[40px] rounded-full" />
        <img 
          src="/icons/icon-512.png" 
          alt="" 
          className="relative w-40 h-40 object-contain"
          style={{ filter: 'drop-shadow(0 0 30px rgba(255, 107, 157, 0.5))' }}
        />
      </motion.div>

      {/* Loading dots */}
      <motion.div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;