import { useState } from "react";
import { Platform, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Box, Text, VStack, Pressable, HStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { useSettings } from "../contexts/settingsContext";
import useAppTheme from "../../hooks/useAppTheme";

export default function NotificationTimeScreen() {
  const { colors } = useAppTheme();
  const { settings, updateNotificationTime } = useSettings();

  const [date, setDate] = useState(() => {
    const d = new Date();

    d.setHours(settings.notificationTime.hour);
    d.setMinutes(settings.notificationTime.minute);
    d.setSeconds(0);

    return d;
  });

  const [showPicker, setShowPicker] = useState(false);

  const hasChanged =
    date.getHours() !== settings.notificationTime.hour ||
    date.getMinutes() !== settings.notificationTime.minute;

  const onChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatTime = (value) =>
    value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const saveTime = async () => {
    await updateNotificationTime(date.getHours(), date.getMinutes());

    Alert.alert(
      "Reminder Updated",
      `Your daily reminder is now scheduled for ${formatTime(date)}.`,
    );

    router.back();
  };

  return (
    <Box
      flex={1}
      px="$5"
      pt="$10"
      style={{
        backgroundColor: colors.bg,
      }}
    >
      {/* Header */}
      <HStack alignItems="center" mb="$8">
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text
          ml="$3"
          fontSize="$2xl"
          fontWeight="$bold"
          style={{
            color: colors.text,
          }}
        >
          Reminder Time
        </Text>
      </HStack>

      <VStack space="lg">
        <Text
          style={{
            color: colors.subText,
            lineHeight: 22,
          }}
        >
          Choose what time you&apos;d like to receive a daily reminder to record your
          expenses.
        </Text>

        <Text
          fontSize="$sm"
          style={{
            color: colors.text,
          }}
        >
          Current reminder: {formatTime(date)}
        </Text>

        {/* Time Card */}
        <Pressable onPress={() => setShowPicker(true)}>
          <Box
            p="$5"
            borderRadius="$xl"
            borderWidth={1}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text
                  fontSize="$sm"
                  style={{
                    color: colors.subText,
                  }}
                >
                  Reminder Time
                </Text>

                <Text
                  mt="$1"
                  fontSize="$2xl"
                  fontWeight="$bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {formatTime(date)}
                </Text>
              </VStack>

              <Feather name="clock" size={28} color={colors.primary} />
            </HStack>
          </Box>
        </Pressable>

        {/* Time Picker */}
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChange}
          />
        )}

        {/* Save Button */}
        <Pressable onPress={saveTime} disabled={!hasChanged}>
          <Box
            mt="$8"
            py="$4"
            borderRadius="$xl"
            alignItems="center"
            opacity={hasChanged ? 1 : 0.5}
            style={{
              backgroundColor: colors.primary,
            }}
          >
            <Text color="$white" fontWeight="$bold" fontSize="$md">
              Save Reminder Time
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}
