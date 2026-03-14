import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(
    () => localStorage.getItem('plask_user_id') || ''
  );
  const [token, setToken] = useState(
    () => localStorage.getItem('plask_token') || ''
  );

  const login = (id, jwtToken) => {
    localStorage.setItem('plask_user_id', id);
    setUserId(id);

    if (jwtToken) {
      localStorage.setItem('plask_token', jwtToken);
      setToken(jwtToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('plask_user_id');
    localStorage.removeItem('plask_token');
    setUserId('');
    setToken('');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{ userId, token, login, logout, isLoggedIn: !!userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
