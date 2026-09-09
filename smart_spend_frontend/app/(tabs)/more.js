import { Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Box, HStack, VStack, Text, SectionList } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import ToggleSwitch from "../../components/toggleSwitch";
import Section from "../../components/section";
import FormRow from "../../components/formRow";
import NavItem from "../../components/navItem";
import { useSettings } from "../contexts/settingsContext";
import { useAuth } from "../contexts/authContext";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableScale({ children, onPress, style }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function SettingsScreen() {
  const {
    settings,
    themeColors,
    toggleTheme,
    toggleInsights,
    toggleNotifications,
  } = useSettings();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/logIn");
      console.log("User is loggged out")
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", "Unable to sign out right now.");
    }
  };

  return (
    <Box flex={1} bg={themeColors.card}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <HStack
          alignItems="center"
          justifyContent="space-between"
          pt="$8"
          mb="$6"
        >
          <HStack alignItems="center">
            <Text
              fontSize="$xl"
              fontWeight="$bold"
              style={{ color: themeColors.text }}
            >
              Settings
            </Text>
          </HStack>
        </HStack>

        {/* APPEARANCE */}
        <Section title="APPEARANCE">
          <FormRow theme={themeColors}>
            <HStack flex={1} justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center" flex={1}>
                <Box
                  style={[
                    styles.iconBox,
                    { backgroundColor: themeColors.iconBg },
                  ]}
                >
                  <Feather
                    name={settings.darkMode ? "moon" : "sun"}
                    size={18}
                    color={themeColors.text}
                  />
                </Box>

                <VStack flex={1}>
                  <Text
                    fontWeight="$semibold"
                    style={{ color: themeColors.text }}
                  >
                    Theme
                  </Text>

                  <Text fontSize="$xs" style={{ color: themeColors.subText }}>
                    {settings.darkMode
                      ? "Dark Mode Enabled"
                      : "Light Mode Enabled"}
                  </Text>
                </VStack>
              </HStack>

              <ToggleSwitch value={settings.darkMode} onToggle={toggleTheme} />
            </HStack>
          </FormRow>
        </Section>

        {/* SMART FEATURES */}
        <Section title="SMART FEATURES" theme={themeColors}>
          <FormRow theme={themeColors}>
            <HStack flex={1} justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center" flex={1}>
                <Box
                  style={[
                    styles.iconBox,
                    { backgroundColor: themeColors.iconBg },
                  ]}
                >
                  <Feather
                    name="bar-chart-2"
                    size={18}
                    color={themeColors.text}
                  />
                </Box>

                <VStack flex={1}>
                  <Text
                    fontWeight="$semibold"
                    style={{ color: themeColors.text }}
                  >
                    Smart Insights
                  </Text>

                  <Text fontSize="$xs" style={{ color: themeColors.subText }}>
                    Analyze spending and receive and personalized
                    recommendations.
                  </Text>
                </VStack>
              </HStack>

              <ToggleSwitch
                value={settings.insights}
                onToggle={toggleInsights}
              />
            </HStack>
          </FormRow>
        </Section>
        {/* NOTIFICATIONS */}
        <Section title="NOTIFICATIONS" theme={themeColors}>
          <FormRow theme={themeColors}>
            <HStack flex={1} justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center" flex={1}>
                <Box
                  style={[
                    styles.iconBox,
                    { backgroundColor: themeColors.iconBg },
                  ]}
                >
                  <Feather name="bell" size={18} color={themeColors.text} />
                </Box>

                <VStack flex={1}>
                  <Text
                    fontWeight="$semibold"
                    style={{ color: themeColors.text }}
                  >
                    Notifications
                  </Text>

                  <Text fontSize="$xs" style={{ color: themeColors.subText }}>
                    Receive reminders and budget alerts.
                  </Text>
                </VStack>
              </HStack>

              <ToggleSwitch
                value={settings.notifications}
                onToggle={toggleNotifications}
              />
            </HStack>
          </FormRow>
          <NavItem
            label="Reminder Time"
            subtitle={`${String(settings.notificationTime.hour).padStart(2, "0")}:${String(
              settings.notificationTime.minute,
            ).padStart(2, "0")}`}
            icon="clock"
            onPress={() => router.push("/settings/notification-time")}
            theme={themeColors}
          />
        </Section>

        {/* DATA */}
        <Section title="DATA & STORAGE" theme={themeColors}>
          <NavItem
            label="Backup"
            subtitle="Export, Import, A complete reset"
            icon="refresh-cw"
            onPress={() => router.push("/settings/backUp&Restore/backUp")}
            theme={themeColors}
          />
        </Section>

        {/* SECURITY */}
        <Section title="SECURITY & PRIVACY" theme={themeColors}>
          <NavItem
            label="App Lock"
            subtitle="Protect app with authentication"
            icon="lock"
            rightText="Off"
            onPress={() => {}}
            theme={themeColors}
          />

          <NavItem
            label="Privacy"
            subtitle="Manage permissions and data"
            icon="shield"
            onPress={() => {}}
            theme={themeColors}
          />
        </Section>

        {/* SUPPORT */}
        <Section title="SUPPORT & INFO" theme={themeColors}>
          <NavItem
            label="Help & Support"
            subtitle="FAQs and contact support"
            icon="help-circle"
            onPress={() => router.push("/settings/help")}
            theme={themeColors}
          />
          <NavItem
            label="Currency"
            subtitle={`${settings.currency.code} (${settings.currency.symbol})`}
            icon="credit-card"
            onPress={() => router.push("/settings/currency")}
            theme={themeColors}
          />
          <NavItem
            label="About"
            subtitle="App version and information"
            icon="info"
            onPress={() => router.push("/settings/about")}
            theme={themeColors}
          />
        </Section>

        {/* LOGOUT */}
        <Box mt="$5">
          <NavItem
            label="Logout"
            icon="log-out"
            danger
            showChevron={false}
            onPress={handleLogout}
            theme={themeColors}
          />
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
