import { Pressable } from "react-native";
import { Box, HStack, VStack, Text } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import useAppTheme from "../../hooks/useAppTheme";

export default function BudgetAssistant({
  title = "Budget Assistant",
  message = "Create your first budget to start tracking your spending.",
  type = "info",
  onPress,
}) {
  const { colors, darkMode } = useAppTheme();

  const styles = {
    info: {
      bg: darkMode ? "#1E3A8A" : "#EFF6FF",
      border: darkMode ? "#2563EB" : "#BFDBFE",
      icon: "💡",
    },

    success: {
      bg: darkMode ? "#14532D" : "#ECFDF5",
      border: darkMode ? "#22C55E" : "#A7F3D0",
      icon: "✅",
    },

    warning: {
      bg: darkMode ? "#78350F" : "#FFFBEB",
      border: darkMode ? "#F59E0B" : "#FCD34D",
      icon: "⚠️",
    },

    danger: {
      bg: darkMode ? "#7F1D1D" : "#FEF2F2",
      border: darkMode ? "#EF4444" : "#FCA5A5",
      icon: "🚨",
    },
  };

  const current = styles[type] || styles.info;

  return (
    <Pressable onPress={onPress}>
      <Box
        mx="$5"
        mt="$4"
        mb="$2"
        px="$4"
        py="$4"
        borderRadius="$2xl"
        borderWidth={1}
        style={{
          backgroundColor: current.bg,
          borderColor: current.border,
        }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack flex={1} space="md">
            <Text fontSize="$2xl">{current.icon}</Text>

            <VStack flex={1}>
              <Text
                fontWeight="$bold"
                fontSize="$md"
                style={{
                  color: colors.text,
                }}
              >
                {title}
              </Text>

              <Text
                mt="$1"
                fontSize="$sm"
                style={{
                  color: colors.subText,
                }}
              >
                {message}
              </Text>
            </VStack>
          </HStack>

          <Feather name="chevron-right" size={20} color={colors.subText} />
        </HStack>
      </Box>
    </Pressable>
  );
}
