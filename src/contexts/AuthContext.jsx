import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sky_chat_token');
    if (token) {
      // Validate token
      fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setUser(data);
          else localStorage.removeItem('sky_chat_token');
        })
        .catch(() => localStorage.removeItem('sky_chat_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (code) => {
    const res = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Kode tidak valid');
    const data = await res.json();
    localStorage.setItem('sky_chat_token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sky_chat_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
}
