import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const msgHandlers = useRef([]);

  const connect = useCallback(() => {
    if (!user?.token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${user.token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => { setConnected(true); console.log('[WS] Connected'); };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) { console.error('[WS] Parse error:', e); }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => console.error('[WS] Error:', err);
    wsRef.current = ws;
  }, [user?.token]);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'new_group_message':
      case 'new_private_message':
        setMessages(prev => [...prev, data]);
        msgHandlers.current.forEach(h => h(data));
        break;
      case 'typing':
        setTypingUsers(prev => ({ ...prev, [data.contactCode]: data.isTyping }));
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({ ...prev, [data.contactCode]: false }));
          }, 3000);
        }
        break;
      case 'user_joined':
      case 'user_left':
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [isAuthenticated, connect]);

  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
      return true;
    }
    return false;
  }, []);

  const sendGroupMessage = useCallback((content, mediaUrl, mediaType) => 
    send('group_message', { content, mediaUrl, mediaType }), [send]);

  const sendPrivateMessage = useCallback((receiverCode, content, mediaUrl, mediaType) => 
    send('private_message', { receiverCode, content, mediaUrl, mediaType }), [send]);

  const setTyping = useCallback((isTyping) => 
    send('typing', { isTyping }), [send]);

  const clearMessages = useCallback(() => setMessages([]), []);

  const onMessage = useCallback((handler) => {
    msgHandlers.current.push(handler);
    return () => {
      msgHandlers.current = msgHandlers.current.filter(h => h !== handler);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{
      connected, messages, typingUsers,
      sendGroupMessage, sendPrivateMessage, setTyping,
      clearMessages, onMessage,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};