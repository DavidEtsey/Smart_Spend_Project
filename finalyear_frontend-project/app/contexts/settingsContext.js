import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { generateNotification } from "../../components/src/notifications/notificationRules";


const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const registerForPushNotifications = async () => {
    if (Platform.OS === "web") {
      console.log("Push notifications are not supported on web.");
      return false;
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminders", {
        name: "Daily Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#85BB65",
        sound: null,
      });
    }

    if (!Device.isDevice) return false;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  };
  const scheduleDailyReminder = async (hour, minute, notification) => {
    if (Platform.OS === "web") {
      console.log("Notifications are not supported on web.");
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const reminders = [
      {
        title: "💰 Track Today's Spending",
        body: "Every expense you record brings you closer to better financial habits.",
      },
      {
        title: "📊 Stay on Budget",
        body: "Have you recorded today's expenses? Keep your budget accurate.",
      },
      {
        title: "🎯 Financial Goal Check",
        body: "Small daily updates lead to big financial wins. Log today's spending.",
      },
      {
        title: "📈 Build Better Habits",
        body: "Consistency is the secret to saving money. Record today's transactions.",
      },
      {
        title: "🌙 Before You Sleep",
        body: "Take a minute to review and record today's expenses.",
      },
      {
        title: "💡 Smart Finance Tip",
        body: "Tracking expenses every day helps reveal spending patterns.",
      },
      {
        title: "🛒 Did You Buy Anything Today?",
        body: "Don't forget to add today's purchases before you forget them.",
      },
      {
        title: "🚀 Keep Your Streak Alive",
        body: "Open the app and record today's transactions to stay consistent.",
      },
    ];

    const reminder = reminders[Math.floor(Math.random() * reminders.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        ...notification,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: "daily-reminders",
        hour,
        minute,
      },
    });
  };

  const disableNotifications = async () => {
    if (Platform.OS === "web") {
      console.log("Notification cancellation is unavailable on web.");
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  };
  
  
  const DEFAULT_SETTINGS = {
    darkMode: false,
    insights: true,
    notifications: false,

    lastBackupDate: null,

    notificationTime: {
      hour: 20,
      minute: 0,
    },

    appLock: false,

    currency: {
      country: "Ghana",
      flag: "🇬🇭",
      name: "Ghanaian Cedi",
      code: "GHS",
      symbol: "₵",
    },
  };
  
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
   const [loading, setLoading] = useState(true);
 

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem("appSettings");

        if (saved) {
          const savedSettings = JSON.parse(saved);
          const lastBackupDate = await AsyncStorage.getItem("lastBackupDate");

          setSettings((prev) => ({
            ...prev,
            ...savedSettings,
            lastBackupDate,
          }));
        }
      } catch (error) {
        console.log("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);
  // Save settings
  useEffect(() => {
    const saveSettings = async () => {
      if (loading) return;

      try {
        await AsyncStorage.setItem("appSettings", JSON.stringify(settings));
      } catch (error) {
        console.log("Error saving settings:", error);
      }
    };

    saveSettings();
  }, [settings, loading]);

  const updateSetting = (key, valueOrUpdater) => {
    setSettings((prev) => ({
      ...prev,
      [key]:
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(prev[key])
          : valueOrUpdater,
    }));
  };

  const restoreSettings = (backupSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...backupSettings,
    }));
  };
  const resetSettings = async () => {
    setSettings({ ...DEFAULT_SETTINGS });

    await AsyncStorage.removeItem("appSettings");
    await AsyncStorage.removeItem("lastBackupDate");
  };

 const updateLastBackupDate = async (date) => {
   updateSetting("lastBackupDate", date);

   try {
     await AsyncStorage.setItem("lastBackupDate", date);
   } catch (error) {
     console.log("Error saving backup date:", error);
   }
 };
  // Toggle helpers
  const toggleTheme = () => updateSetting("darkMode", (prev) => !prev);

  const toggleInsights = () => updateSetting("insights", (prev) => !prev);

  const toggleNotifications = async () => {
    if (Platform.OS === "web") {
      updateSetting("notifications", !settings.notifications);
      return;
    }

    if (!settings.notifications) {
      const granted = await registerForPushNotifications();

      if (!granted) return;

      await scheduleDailyReminder(
        settings.notificationTime.hour,
        settings.notificationTime.minute,
      );
      updateSetting("notifications", true);
    } else {
      await disableNotifications();
      updateSetting("notifications", false);
    }
  };
  const updateNotificationTime = async (hour, minute) => {
    updateSetting("notificationTime", {
      hour,
      minute,
    });

    if (settings.notifications && Platform.OS !== "web") {
      await scheduleDailyReminder(hour, minute);
    }
  };

  const toggleAppLock = () => updateSetting("appLock", (prev) => !prev);
  // Theme colors
  const themeColors = {
    // backgrounds
    bg: settings.darkMode ? "#0F172A" : "#F3F4F6",
    card: settings.darkMode ? "#111827" : "#FFFFFF",
    surface: settings.darkMode ? "#1F2937" : "#F6F6F6",

    // NEW
    header: settings.darkMode ? "#111827" : "#FFFFFF",

    // text
    text: settings.darkMode ? "#FFFFFF" : "#111827",
    textSecondary: settings.darkMode ? "#94A3B8" : "#6B7280",

    subText: settings.darkMode ? "#94A3B8" : "#6B7280",

    border: settings.darkMode ? "#374151" : "#E5E7EB",

    primary: "#85BB65",
    onPrimary: "#FFFFFF",

    success: "#85BB65",
    overlay: "rgba(0,0,0,0.4)",
    iconBg: settings.darkMode ? "rgba(255,255,255,0.06)" : "#F3F4F6",
  };
  return (
    <SettingsContext.Provider
      value={{
        loading,
        settings,
        themeColors,
        updateSetting,
        updateLastBackupDate,
        restoreSettings,
        resetSettings,
        toggleTheme,
        toggleInsights,
        toggleNotifications,
        updateNotificationTime,
        toggleAppLock,
        scheduleDailyReminder,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
