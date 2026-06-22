import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = ({ contactCode }) => {
  return (
    <div className="flex justify-start">
      <div className="bubble-received py-2 px-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-secondary rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;