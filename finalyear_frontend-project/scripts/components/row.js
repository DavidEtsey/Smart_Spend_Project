import { Pressable, HStack, Text, Box } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";

export default function Row({
  label,
  value,
  highlight = false,
  onPress,
  editable = false,
  icon = "chevron-right",
}) {
  return (
    <Pressable onPress={onPress} disabled={!editable}>
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        py="$4"
        borderRadius="$lg"
        bg="$backgroundLight0"
        borderWidth={1}
        borderColor={highlight ? "#ef4444" : "$borderLight200"}
      >
        {/* Label */}
        <Text fontSize="$sm" color="$text400">
          {label}
        </Text>

        {/* Value */}
        <HStack alignItems="center" space="xs">
          <Text
            fontSize="$md"
            fontWeight="$medium"
            color={highlight ? "#ef4444" : "$text700"}
          >
            {value}
          </Text>

          {editable && (
            <Feather
              name={icon}
              size={16}
              color={highlight ? "#ef4444" : "#999"}
            />
          )}
        </HStack>
      </HStack>
    </Pressable>
  );
}
