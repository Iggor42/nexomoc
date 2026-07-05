import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user] = useState(null);
  const [loading] = useState(false);

  const logout = () => {};
  const loginWithGoogle = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
