import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  authReady: false,
  signIn: async () => {},
  signOut: async () => {},
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        const storedUser = await SecureStore.getItemAsync("user");

        if (token) {
          setUser(storedUser ? JSON.parse(storedUser) : null);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to load auth session:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthReady(true);
      }
    };

    loadSession();
  }, []);

  const signIn = async ({ token, userData }) => {
    try {
      if (token) {
        await SecureStore.setItemAsync("accessToken", token);
      }

      if (userData) {
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
      }

      setUser(userData || null);
      setIsAuthenticated(true);
      setAuthReady(true);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthReady(true);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      authReady,
      signIn,
      signOut,
    }),
    [user, isAuthenticated, authReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
