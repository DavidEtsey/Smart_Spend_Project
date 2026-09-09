import { Pressable, StyleSheet } from "react-native";
import { Box, VStack, Text } from "@gluestack-ui/themed";

export default function GridItem({ children, isActive, onPress, custom }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isActive && stylestyles.activeCard,
        custom && styles.customCard, // for Add New tile
      ]}
    >
      <VStack alignItems="center" justifyContent="center" space="xs">
        {children}
      </VStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeCard: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  customCard: {
    backgroundColor: "#f1f5f9",
    borderStyle: "dashed",
    borderColor: "#6b7280",
    borderWidth: 1.5,
  },
});
