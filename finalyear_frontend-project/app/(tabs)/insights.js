import { ScrollView, StyleSheet } from "react-native";
import { Box, Text, VStack, HStack } from "@gluestack-ui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import InsightCard from "../../components/insightCard";
import { generateInsights } from "../../components/src/engine.js/insightEngine";
import { useTransactions } from "../contexts/transactionsContext";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../contexts/settingsContext";
import { formatCurrency } from "../helpers/formatCurrency";
import { useBudgets } from "../contexts/budgetContext";

export default function InsightsScreen() {
  const { colors, darkMode } = useAppTheme();
  const { settings } = useSettings();
  const { budgets } = useBudgets();

  const {
    transactions,
    monthlyTransactions,
    monthlyExpense,
    monthlyExpenseTransactions,
    topCategory,
    topCategoryAmount,
  } = useTransactions();
  if (!settings.insights) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$6"
        style={{ backgroundColor: colors.bg }}
      >
        <Feather name="bar-chart-2" size={54} color={colors.subText} />

        <Text
          mt="$5"
          fontSize="$xl"
          fontWeight="$bold"
          style={{ color: colors.text }}
        >
          Smart Insights are turned off
        </Text>

        <Text mt="$2" textAlign="center" style={{ color: colors.subText }}>
          Enable Smart Insights in Settings to receive spending analysis,
          trends, and money-saving recommendations.
        </Text>
      </Box>
    );
  }
  const insights = generateInsights(monthlyTransactions) || [];

  const expenses = monthlyExpenseTransactions;

  // HISTORICAL PRE-BUDGET EXPENSE BEHAVIOR

  // HISTORICAL PRE-BUDGET EXPENSE BEHAVIOR
  //
  // This checks ALL expense transactions, not just this month's.
  // An expense is reported ONLY when:
  // 1. A budget exists for the same category/month/year
  // 2. The expense happened BEFORE that budget was created
  //
  // Expenses made AFTER the budget was created are ignored.

  const allExpenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );

  const preBudgetExpenses = allExpenseTransactions.filter((expense) => {
    if (!expense.createdAt || !expense.category) {
      return false;
    }

    const expenseDate = new Date(expense.createdAt);

    if (Number.isNaN(expenseDate.getTime())) {
      return false;
    }

    // Find the budget for the SAME category,
    // SAME month, and SAME year.

    const budget = budgets.find(
      (budget) =>
        budget.category?.toLowerCase() === expense.category?.toLowerCase() &&
        Number(budget.month) === expenseDate.getMonth() &&
        Number(budget.year) === expenseDate.getFullYear() &&
        budget.createdAt,
    );

    // No budget exists for this category/month/year.
    if (!budget) {
      return false;
    }

    const budgetTime = new Date(budget.createdAt).getTime();

    if (Number.isNaN(budgetTime)) {
      return false;
    }

    // ONLY report expenses that happened BEFORE
    // the budget was created.
    return expenseDate.getTime() < budgetTime;
  });

  const preBudgetTotal = preBudgetExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );

  const preBudgetCategories = [
    ...new Set(
      preBudgetExpenses.map((expense) => expense.category).filter(Boolean),
    ),
  ];

  const totalSpent = monthlyExpense;

  const totalTransactions = monthlyTransactions.length;

  const avgDaily = totalSpent > 0 ? totalSpent / 30 : 0;

  // SAVING OPPORTUNITY
  const suggestedSavings =
    topCategoryAmount > 0 ? Math.round(topCategoryAmount * 0.15) : 0;

  // FINANCIAL HEALTH SCORE
  let financialHealth = 100;

  if (totalSpent > 5000) financialHealth -= 15;
  if (avgDaily > 200) financialHealth -= 10;
  if (expenses.length > 40) financialHealth -= 8;
  if (topCategoryAmount > totalSpent * 0.45) financialHealth -= 12;

  financialHealth = Math.max(financialHealth, 45);

  // EMPTY STATE
  if (!monthlyTransactions.length) {
    return (
      <Box
        flex={1}
        style={{
          backgroundColor: colors.bg,
        }}
        mt="$5"
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* HEADER */}
          <VStack space="xs" mb="$8" pt="8" mt="$2">
            <Text
              style={[
                styles.heading,
                {
                  color: colors.text,
                },
              ]}
            >
              Insights
            </Text>

            <Text
              style={[
                styles.subHeading,
                {
                  color: colors.subText,
                },
              ]}
            >
              AI-powered spending intelligence.
            </Text>
          </VStack>

          {/* EMPTY CARD */}
          <Box
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Box style={styles.emptyIcon}>
              <Feather name="pie-chart" size={30} color="#3B82F6" />
            </Box>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No financial insights yet
            </Text>
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.subText,
                },
              ]}
            >
              Add transactions to unlock spending patterns, saving
              opportunities, and smart recommendations.
            </Text>
          </Box>

          {/* TIPS */}
          <VStack mt="$6" space="md">
            <InsightCard
              type="tip"
              title="Track daily expenses"
              message="Users who track daily usually save more monthly."
            />
            <InsightCard
              type="info"
              title="Build smarter habits"
              message="Insights become more accurate after 7-14 days of activity."
            />
          </VStack>
        </ScrollView>
      </Box>
    );
  }

  return (
    <Box flex={1} mt="$5">
      <ScrollView
        style={{
          backgroundColor: colors.bg,
        }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient
          colors={
            darkMode
              ? ["#071A0D", "#185C2D", "#0B2A17"]
              : ["#3F7F3B", "#68A94F", "#8BC66A"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <VStack space="xs">
            <Text style={styles.heroTitle}>Financial Insights</Text>
            <Text style={styles.heroSubtitle}>
              Behavioral analysis & money-saving opportunities.
            </Text>
          </VStack>

          {/* QUICK STATS */}
          <HStack mt="$5" space="md">
            <Box
              style={[
                styles.statCard,
                {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text style={styles.statValue}>
                {formatCurrency(totalSpent, settings.currency)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </Box>

            <Box
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.darkMode
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text style={styles.statValue}>
                {formatCurrency(avgDaily, settings.currency)}
              </Text>
              <Text style={styles.statLabel}>Daily Avg</Text>
            </Box>
          </HStack>

          <HStack mt="$3" space="md">
            <Box
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.darkMode
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text style={styles.statValue}>{topCategory}</Text>
              <Text style={styles.statLabel}>Top Category</Text>
            </Box>

            <Box
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.darkMode
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text style={styles.statValue}>{totalTransactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </Box>
          </HStack>
        </LinearGradient>

        {/* ACTIONABLE INSIGHTS */}
        <VStack px="$4" mt="$5" space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Smart Recommendations
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color: colors.subText,
                  },
                ]}
              >
                Personalized financial suggestions.
              </Text>
            </VStack>
            <Box style={styles.aiBadge}>
              <Text style={styles.aiText}>AI</Text>
            </Box>
          </HStack>

          {/* SYSTEM INSIGHTS */}
          {insights.length === 0 ? (
            <Box
              style={[
                styles.noInsightCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Feather name="bar-chart-2" size={26} color="#94A3B8" />
              <Text
                style={[
                  styles.noInsightTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                No insights available yet
              </Text>
              <Text
                style={[
                  styles.noInsightText,
                  {
                    color: colors.subText,
                  },
                ]}
              >
                Continue using the app to generate smarter financial patterns.
              </Text>
            </Box>
          ) : (
            insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))
          )}

          {/* MONEY SAVING */}
          <Box style={styles.savingsCard}>
            <HStack alignItems="center" space="sm">
              <Box style={styles.savingsIcon}>
                <Feather name="trending-down" size={18} color="#16A34A" />
              </Box>
              <VStack flex={1}>
                <Text style={styles.savingsTitle}>
                  Money Saving Opportunity
                </Text>
                <Text style={styles.savingsText}>
                  Reducing your spending in {topCategory} by 15% could save
                  approximately{" "}
                  {formatCurrency(suggestedSavings, settings.currency)} this
                  month.
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* BEHAVIORAL PATTERNS */}
          <Box style={styles.patternCard}>
            <HStack alignItems="center" space="sm">
              <Box style={styles.patternIcon}>
                <Feather name="activity" size={18} color="#3B82F6" />
              </Box>

              <VStack flex={1}>
                <Text style={styles.patternTitle}>Spending Behavior</Text>

                <Text style={styles.patternText}>
                  Most of your spending is currently focused on {topCategory},
                  which accounts for a large portion of your expenses.
                </Text>

                {preBudgetExpenses.length > 0 && (
                  <Text style={styles.patternText}>
                    You made {formatCurrency(preBudgetTotal, settings.currency)}{" "}
                    in expenses before setting budgets for{" "}
                    {preBudgetCategories.length === 1
                      ? preBudgetCategories[0]
                      : preBudgetCategories.length === 2
                        ? `${preBudgetCategories[0]} and ${preBudgetCategories[1]}`
                        : `${preBudgetCategories.slice(0, -1).join(", ")}, and ${
                            preBudgetCategories[preBudgetCategories.length - 1]
                          }`}
                    . Consider setting a budget before making an expense to help
                    plan your spending from the beginning.
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>

          {/* SPENDING ACTIVITY */}
          <Box style={styles.patternCard}>
            <HStack alignItems="center" space="sm">
              <Box style={styles.patternIcon}>
                <Feather name="zap" size={18} color="#EA580C" />
              </Box>
              <VStack flex={1}>
                <Text style={styles.patternTitle}>Spending Activity</Text>
                <Text style={styles.patternText}>
                  You recorded {totalTransactions} transactions this month.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  hero: {
    paddingTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#575a61",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#282b31",
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: "#FFDD00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  aiText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  noInsightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },
  noInsightTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  noInsightText: {
    marginTop: 6,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 20,
  },
  savingsCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 22,
    padding: 18,
    marginTop: 10,
  },
  savingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  savingsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  savingsText: {
    marginTop: 4,
    color: "#047857",
    lineHeight: 20,
  },
  patternCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 22,
    padding: 18,
  },
  patternIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  patternText: {
    marginTop: 4,
    color: "#2563EB",
    lineHeight: 20,
  },
  healthCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    marginTop: 6,
  },
  healthTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  healthSub: {
    marginTop: 4,
    color: "#9CA3AF",
    fontSize: 13,
  },
  healthScore: {
    fontSize: 40,
    fontWeight: "800",
    color: "#22C55E",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 8,
    color: "#6B7280",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subHeading: {
    fontSize: 14,
    color: "#6B7280",
  },
});
