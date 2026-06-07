import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// 💖 Couple's shared password & profile
export const COUPLE = {
  password: import.meta.env.VITE_APP_PASSWORD,
  anniversary: '2025-09-12', // 12th September — adjust the year if needed
  him: { name: 'Abdul Hadee', nickname: 'Hadee', color: '#7BA7BC' },
  her: { name: 'Mehak', nickname: 'Mehak', color: '#F58A9C' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 'him' | 'her' | null
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('couple_user');
    if (saved) setUser(saved);
    setLoaded(true);
  }, []);

  const login = (password, who) => {
    if (password === COUPLE.password) {
      setUser(who);
      localStorage.setItem('couple_user', who);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('couple_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loaded, COUPLE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
