import { Pressable } from "react-native";
import { HStack, Text, Box } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NavItem({ label, onPress, icon, rightText, theme }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
              backgroundColor: theme.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name={icon} size={18} color={theme.text} />
          </Box>

          <Text style={{ color: theme.text }}>{label}</Text>
        </HStack>

        {/* RIGHT */}
        <HStack alignItems="center" space="sm">
          {rightText && (
            <Text style={{ color: theme.subText }}>{rightText}</Text>
          )}

          <Feather name="chevron-right" size={18} color={theme.subText} />
        </HStack>
      </HStack>
    </AnimatedPressable>
  );
}
