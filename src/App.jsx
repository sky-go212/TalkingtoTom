import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen.jsx';
import VerifyAgePage from './components/VerifyAgePage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';
import PrivateChatListPage from './pages/PrivateChatListPage.jsx';
import PrivateChatPage from './pages/PrivateChatPage.jsx';
import ContactManagerPage from './pages/ContactManagerPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { WebSocketProvider } from './contexts/WebSocketContext.jsx';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AuthProvider>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<VerifyAgePage />} />
          <Route path="/chat" element={<GroupChatPage />} />
          <Route path="/private" element={<PrivateChatListPage />} />
          <Route path="/private/:roomId" element={<PrivateChatPage />} />
          <Route path="/contacts" element={<ContactManagerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;