import { Box, HStack, Text } from "@gluestack-ui/themed";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import useAppTheme from "../../hooks/useAppTheme";

export default function Header({ onSearchPress, onFilterPress }) {
  const { colors } = useAppTheme();

  return (
    <Box
      px="$5"
      py="$4"
      style={{
        backgroundColor: colors.header,
      }}
    >
      <HStack justifyContent="space-between" alignItems="center" pt="$10">
        <Pressable onPress={onSearchPress}>
          <Feather name="search" size={22} color={colors.text} />
        </Pressable>

        <Text
          fontSize="$xl"
          fontWeight="$bold"
          style={{
            color: colors.text,
          }}
        >
          Trans.
        </Text>

        <Pressable onPress={onFilterPress}>
          <Feather name="sliders" size={22} color={colors.text} />
        </Pressable>
      </HStack>
    </Box>
  );
}
