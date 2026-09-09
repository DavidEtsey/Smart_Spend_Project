import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");

        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save whenever theme changes
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("theme", JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, loading]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const themeColors = {
    bg: isDarkMode ? "#0F172A" : "#F3F4F6",
    card: isDarkMode ? "#111827" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#111827",
    subText: isDarkMode ? "#94A3B8" : "#6B7280",
    border: isDarkMode ? "#1E293B" : "#E5E7EB",
    iconBg: isDarkMode ? "rgba(255,255,255,0.06)" : "#F3F4F6",
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        themeColors,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
