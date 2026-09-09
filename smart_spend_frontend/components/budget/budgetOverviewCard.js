import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useBudgets } from "../../app/contexts/budgetContext";
import BudgetRing from "./budgetRing";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";

export default function BudgetOverviewCard({ onCreateBudget }) {
  const { settings } = useSettings();
  const { colors } = useAppTheme();

  const {
    monthlyIncome,
    allocatedBudget,
    availableIncome,
    budgetRemaining,
    overallProgress,
  } = useBudgets();

  return (
    <Box
      mx="$5"
      mt="$6"
      borderRadius="$3xl"
      p="$6"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Box alignItems="center" justifyContent="center">
        <BudgetRing
          progress={overallProgress}
          remaining={budgetRemaining}
          budget={allocatedBudget}
        />
      </Box>

      <HStack mt="$6" alignItems="center">
        <VStack flex={1} alignItems="center" gap="$1">
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Income
          </Text>
          <Text fontSize="$md" fontWeight="$bold" style={{ color: "#15803D" }}>
            {formatCurrency(monthlyIncome, settings.currency)}
          </Text>
        </VStack>

        <Box
          width={1}
          alignSelf="stretch"
          my="$1"
          style={{ backgroundColor: colors.border }}
        />

        <VStack flex={1} alignItems="center" gap="$1">
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Budgeted
          </Text>
          <Text fontSize="$md" fontWeight="$bold" style={{ color: "#1D4ED8" }}>
            {formatCurrency(allocatedBudget, settings.currency)}
          </Text>
        </VStack>

        <Box
          width={1}
          alignSelf="stretch"
          my="$1"
          style={{ backgroundColor: colors.border }}
        />

        <VStack flex={1} alignItems="center" gap="$1">
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Balance
          </Text>
          <Text
            fontSize="$md"
            fontWeight="$bold"
            style={{ color: availableIncome >= 0 ? "#15803D" : "#DC2626" }}
          >
            {formatCurrency(availableIncome, settings.currency)}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}
