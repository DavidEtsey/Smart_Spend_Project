import { Feather } from "@expo/vector-icons";
import { Box, HStack, Text } from "@gluestack-ui/themed";
import { Pressable } from "react-native";
import { useTransactions } from "../../app/contexts/transactionsContext";
import useAppTheme from "../../hooks/useAppTheme";

export default function BudgetHeader() {
   const { colors } = useAppTheme();

   const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } =
     useTransactions();


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

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      pt="$16"
      pb="$6"
      px="$5"
      borderRadius="$3xl"
      shadowColor="$black"
      shadowOpacity={0.08}
      shadowRadius={12}
      elevation={4}
      position="relative"
      width="100%"
    >
      <Text
        fontSize="$2xl"
        fontWeight="$bold"
        textAlign="center"
        mb="$5"
        style={{ color: colors.text }}
      >
        Budget
      </Text>

      {/* Month Selector */}
      <HStack alignItems="center" justifyContent="center" space="xl">
        <Pressable onPress={goToPreviousMonth}>
          <Feather name="chevron-left" size={24} color="#16A34A" />
        </Pressable>

        <Text fontSize="$lg" fontWeight="$bold" style={{ color: colors.text }}>
          {months[selectedMonth-1]} {selectedYear}
        </Text>

        <Pressable onPress={goToNextMonth}>
          <Feather name="chevron-right" size={24} color="#16A34A" />
        </Pressable>
      </HStack>
    </Box>
  );
}
