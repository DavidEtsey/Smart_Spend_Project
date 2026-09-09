import { useState } from "react";
import { Pressable } from "react-native";
import { Box, HStack, Text } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import useAppTheme from "../../hooks/useAppTheme";

export default function FaqCard({ question, answer }) {
  const [expanded, setExpanded] = useState(false);

  const { colors } = useAppTheme();

  return (
    <Box
      mb="$3"
      borderRadius="$xl"
      overflow="hidden"
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Pressable onPress={() => setExpanded(!expanded)}>
        <HStack
          px="$4"
          py="$4"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text flex={1} fontWeight="$semibold" color={colors.text}>
            {question}
          </Text>

          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text}
          />
        </HStack>
      </Pressable>

      {expanded && (
        <Box px="$4" pb="$4" borderTopWidth={1} borderColor={colors.border}>
          <Text mt="$3" lineHeight={22} color={colors.subText}>
            {answer}
          </Text>
        </Box>
      )}
    </Box>
  );
}
