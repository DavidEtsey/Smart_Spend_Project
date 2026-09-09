import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { useBudgets } from "../../app/contexts/budgetContext";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";

export default function InsightCard() {
  const { budgetSummary, totalBudgetSpent, allocatedBudget } = useBudgets();
  const { colors } = useAppTheme();
  const { settings } = useSettings();
  
  if (!settings.insights) {
    return null;
  }

  const getCategoryName = (budget) =>
    budget?.category || budget?.name || "--";

  // Highest spending category
  const highestSpent =
    budgetSummary.length > 0
      ? [...budgetSummary].sort((a, b) => b.spent - a.spent)[0]
      : null;

  // Closest to budget limit (not exceeded)
  const nearLimit =
    budgetSummary.length > 0
      ? [...budgetSummary]
          //.filter((b) => b.percentage < 100)
          .sort((a, b) => b.percentage - a.percentage)[0]
      : null;

  // Best managed (lowest percentage used)
  const bestManaged =
    budgetSummary.length > 0
      ? [...budgetSummary].sort((a, b) => a.percentage - b.percentage)[0]
      : null;

  // Money saved
  const saved = Math.max(allocatedBudget - totalBudgetSpent, 0);

  const insights = [
    {
      title: "Highest Spending",
      value: getCategoryName(highestSpent),
      subtitle: highestSpent
        ? formatCurrency(highestSpent.spent, settings.currency)
        : "",
      icon: "trending-up",
      color: "#EF4444",
    },
    {
      title: "Near Limit",
      value: getCategoryName(nearLimit),
      subtitle: nearLimit ? `${Math.round(nearLimit.percentage)}% used` : "",
      icon: "alert-triangle",
      color: "#F59E0B",
    },
    {
      title: "Best Managed",
      value: getCategoryName(bestManaged),
      subtitle: bestManaged
        ? `${Math.round(bestManaged.percentage)}% used`
        : "",
      icon: "check-circle",
      color: "#22C55E",
    },
    {
      title: "Saved",
      value: formatCurrency(saved, settings.currency),
      subtitle: "Remaining budget",
      icon: "dollar-sign",
      color: "#3B82F6",
    },
  ];

  return (
    <Box mx="$5" mt="$6">
      <Text
        fontSize="$lg"
        fontWeight="$bold"
        mb="$4"
        style={{ color: colors.text }}
      >
        Budget Insights
      </Text>

      {insights.map((item, index) => (
        <Box
          key={index}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          borderRadius="$2xl"
          p="$4"
          mb="$3"
          shadowColor="$black"
          shadowOpacity={0.05}
          shadowRadius={10}
          elevation={2}
        >
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space="md">
              <Box
                w={46}
                h={46}
                borderRadius="$full"
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor: colors.iconBg,
                }}
              >
                <Feather name={item.icon} size={22} color={item.color} />
              </Box>

              <VStack>
                <Text fontSize="$xs" style={{ color: colors.subText }}>
                  {item.title}
                </Text>

                <Text
                  fontWeight="$bold"
                  fontSize="$md"
                  style={{ color: colors.text }}
                >
                  {item.value}
                </Text>

                <Text fontSize="$xs" style={{ color: colors.subText }}>
                  {item.subtitle}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Box>
      ))}
    </Box>
  );
}
