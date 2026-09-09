import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TransactionProvider from "./contexts/transactionsContext";
import BudgetProvider from "./contexts/budgetContext";
import AuthProvider from "./contexts/authContext";
import { SettingsProvider } from "./contexts/settingsContext";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <TransactionProvider>
          <SettingsProvider>
            <BudgetProvider>
              <SafeAreaProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                >
                  {/* Auth screens */}
                  <Stack.Screen
                    name="(auth)"
                    options={{
                      presentation: "card",
                    }}
                  />

                  {/* Tabs (main app) */}
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      presentation: "card",
                    }}
                  />

                  {/* Transaction page */}
                  <Stack.Screen
                    name="trans"
                    options={{
                      presentation: "card",
                      animation: "slide_from_bottom",
                    }}
                  />
                </Stack>
                <StatusBar style="light" />
              </SafeAreaProvider>
            </BudgetProvider>
          </SettingsProvider>
        </TransactionProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
