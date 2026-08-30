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
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      borderRadius="$3xl"
      p="$6"
      shadowColor="$black"
      shadowOpacity={0.08}
      shadowRadius={15}
      elevation={6}
    >
      <Box alignItems="center" justifyContent="center">
        <BudgetRing
          progress={overallProgress}
          remaining={budgetRemaining}
          budget={allocatedBudget}
        />
      </Box>
      <HStack space="md" justifyContent="space-between">
        <Box
          flex={1}
          style={{
            backgroundColor: colors.iconBg,
          }}
          borderRadius="$xl"
          p="$4"
          mt="$4"
          alignItems="center"
        >
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Income
          </Text>

          <Text mt="$1" fontSize="$md" fontWeight="$bold" color="$green700">
            {formatCurrency(monthlyIncome, settings.currency)}
          </Text>
        </Box>

        <Box
          flex={1}
          style={{
            backgroundColor: colors.iconBg,
          }}
          borderRadius="$xl"
          p="$4"
          mt="$4"
          alignItems="center"
        >
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Budgeted
          </Text>

          <Text mt="$1" fontSize="$md" fontWeight="$bold" color="$blue700">
            {formatCurrency(allocatedBudget, settings.currency)}
          </Text>
        </Box>

        <Box
          flex={1}
          style={{
            backgroundColor: colors.iconBg,
          }}
          borderRadius="$xl"
          p="$4"
          mt="$4"
          alignItems="center"
        >
          <Text fontSize="$xs" style={{ color: colors.subText }}>
            Balance
          </Text>

          <Text
            mt="$1"
            fontSize="$md"
            fontWeight="$bold"
            color={availableIncome >= 0 ? "$green700" : "$red600"}
          >
            {formatCurrency(availableIncome, settings.currency)}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}
