// Rewrite
import { createContext, useState, useContext } from "react";

const AuthContext = createContext({});

export  default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // SIMPLE frontend-only functions
  const signIn = () =>
    setUser({ name: "Demo User", email: "demo@example.com" });
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
