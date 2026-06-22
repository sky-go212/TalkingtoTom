import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const ChatBubble = ({ message, isOwn }) => {
  const isMedia = message.mediaType && message.mediaUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isOwn ? 'bubble-sent' : 'bubble-received'}`}>
        {!isOwn && message.senderName && (
          <p className="text-xs text-primary font-semibold mb-1">{message.senderName}</p>
        )}

        {isMedia && message.mediaType === 'image' && (
          <img src={message.mediaUrl} alt="" className="rounded-lg mb-2 max-w-full" loading="lazy" />
        )}

        {isMedia && message.mediaType === 'voice' && (
          <audio controls className="max-w-full mb-2">
            <source src={message.mediaUrl} type="audio/webm" />
          </audio>
        )}

        {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}

        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-[10px] opacity-70">
            {format(new Date(message.timestamp || Date.now()), 'HH:mm')}
          </span>
          {isOwn && <CheckCheck className="w-3 h-3 text-secondary" />}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;