 
 import { Pressable } from "react-native";
 import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withSpring,
 } from "react-native-reanimated";
 import { useEffect, useState } from "react";

 import * as Haptics from "expo-haptics";

 export default function ToggleSwitch({ value, onToggle }) {
  const translateX = useSharedValue(value ? 22 : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? 22 : 0);
  }, [value]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        onToggle();
        Haptics.selectionAsync();
      }}
      style={{
        width: 52,
        height: 30,
        borderRadius: 20,
        backgroundColor: value ? "#22c55e" : "#d1d5db",
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
            backgroundColor: "#fff",
          },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}
