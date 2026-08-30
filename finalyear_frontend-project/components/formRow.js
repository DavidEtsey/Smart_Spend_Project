import { HStack, Text } from "@gluestack-ui/themed";
import useAppTheme from "../hooks/useAppTheme";

export default function FormRow({ label, children,}) {
  const { colors } = useAppTheme();
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      px="$3"
      py="$3"
      borderBottomWidth={1}
      borderBottomColor={colors.border}
    >
      <Text style={{ color: colors.text }}>{label}</Text>

      <HStack flex={1} justifyContent="flex-end">
        {children}
      </HStack>
    </HStack>
  );
}
