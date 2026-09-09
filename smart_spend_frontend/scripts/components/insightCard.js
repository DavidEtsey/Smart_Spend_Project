// components/InsightCard.js
import { Box, Text, VStack, HStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";

const ICONS = {
  warning: "alert-circle",
  info: "info",
  success: "check-circle",
  tip: "lightbulb",
};

const COLORS = {
  warning: "$red600",
  info: "$blue600",
  success: "$green600",
  tip: "$teal600",
};

export default function InsightCard({ type, title, message, action }) {
  if (!type || !title || !message) return null;

  return (
    <Box
      bg="$white"
      p="$5"
      borderRadius="$2xl"
      shadow={2} // subtle shadow
      opacity={0.95} // soft card
      mb="$5" // margin-bottom for spacing between cards
      w="100%" // full width of parent VStack
    >
      <HStack space="md" alignItems="flex-start">
        {/* Icon */}
        <Box
          bg={COLORS[type] || "$blue600"}
          borderRadius="$full"
          w={10}
          h={10}
          alignItems="center"
          justifyContent="center"
        >
          <Feather name={ICONS[type] || "info"} size={20} color="$white" />
        </Box>

        {/* Content */}
        <VStack flex={1} space="xs">
          <Text fontWeight="$bold" fontSize="$md">
            {title}
          </Text>
          <Text fontSize="$sm" opacity={0.7} lineHeight={20}>
            {message}
          </Text>
          {action && (
            <Text fontSize="$xs" mt="$1" color="$primary500">
              {action}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
