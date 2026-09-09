import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import useAppTheme from "../hooks/useAppTheme";

export default function ToggleSwitch({
  value,
  onToggle,
  activeColor = "#22c55e",
}) {
  const translateX = useSharedValue(value ? 22 : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? 22 : 0);
  }, [value]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessible
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => {
        onToggle();
        Haptics.selectionAsync();
      }}
      style={{
        width: 52,
        height: 30,
        borderRadius: 20,
        backgroundColor: value ? activeColor : colors.border,
        justifyContent: "center",
        padding: 3,
      }}
    >
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.card,
          },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}
