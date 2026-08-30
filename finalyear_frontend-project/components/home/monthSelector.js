import { Feather } from "@expo/vector-icons";
import { HStack, Text } from "@gluestack-ui/themed";
import { Pressable } from "react-native";
import useAppTheme from "../../hooks/useAppTheme";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthSelector({
  selectedMonth,
  selectedYear,
  changeMonth,
}) {
  const { colors } = useAppTheme();

  return (
    <HStack
      justifyContent="center"
      alignItems="center"
      py="$3"
      style={{
        backgroundColor: colors.bg,
      }}
    >
      <Pressable onPress={() => changeMonth(-1)}>
        <Feather name="chevron-left" size={24} color={colors.text} />
      </Pressable>

      <Text
        mx="$4"
        fontWeight="$bold"
        fontSize="$md"
        style={{
          color: colors.text,
        }}
      >
        {months[selectedMonth-1]} {selectedYear}
      </Text>

      <Pressable onPress={() => changeMonth(1)}>
        <Feather name="chevron-right" size={24} color={colors.text} />
      </Pressable>
    </HStack>
  );
}
