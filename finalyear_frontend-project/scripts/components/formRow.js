import { HStack, Text } from "@gluestack-ui/themed";

export default function FormRow({ label, children, theme }) {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      px="$3"
      py="$3"
      borderBottomWidth={1}
      borderBottomColor={theme.border}
    >
      <Text style={{ color: theme.text }}>{label}</Text>

      <HStack flex={1} justifyContent="flex-end">
        {children}
      </HStack>
    </HStack>
  );
}
