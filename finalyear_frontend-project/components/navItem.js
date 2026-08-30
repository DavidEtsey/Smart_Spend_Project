import { Pressable } from "react-native";
import { HStack, Text, Box } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import useAppTheme from "../hooks/useAppTheme";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NavItem({
  label,
  rightText,
  theme,
  subtitle,
  onPress,
  icon,
  danger = false,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const { colors } = useAppTheme();

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={animatedStyle}
    >
      <HStack
        px="$4"
        py="$4"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* LEFT */}
        <HStack alignItems="center" space="md" flex={1}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name={icon} size={18} color={colors.text} />
          </Box>

          <Box flex={1}>
            <Text
              style={{
                color: danger ? "#ef4444" : colors.text,
              }}
            >
              {label}
            </Text>

            {subtitle && (
              <Text fontSize="$xs" style={{ color: colors.subText }}>
                {subtitle}
              </Text>
            )}
          </Box>
        </HStack>

        {/* RIGHT */}
        <HStack alignItems="center" space="sm">
          {rightText && (
            <Text style={{ color: colors.subText }}>{rightText}</Text>
          )}

          <Feather name="chevron-right" size={18} color={colors.subText} />
        </HStack>
      </HStack>
    </AnimatedPressable>
  );
}
