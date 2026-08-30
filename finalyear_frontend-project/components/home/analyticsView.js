import React, { useMemo } from "react";
import { ScrollView, Dimensions } from "react-native";
import { Box, HStack, VStack, Text } from "@gluestack-ui/themed";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useTransactions } from "../../app/contexts/transactionsContext";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";

const screenWidth = Dimensions.get("window").width;


const CATEGORY_OPTIONS = {
  expense: [
    { icon: "🍔", name: "Food", color: "#f59e0b", bg: "#FFF8E7" },
    { icon: "🚕", name: "Transport", color: "#f97316", bg: "#FFF3EB" },
    { icon: "🏠", name: "Rent", color: "#64748b", bg: "#F1F5F9" },
    { icon: "🛍️", name: "Shopping", color: "#8b5cf6", bg: "#F5F0FF" },
    { icon: "🎬", name: "Entertainment", color: "#3b82f6", bg: "#EFF4FF" },
    { icon: "🩺", name: "Health", color: "#06b6d4", bg: "#ECFEFF" },
    { icon: "💡", name: "Utilities", color: "#eab308", bg: "#FFFBE6" },
    { icon: "📚", name: "Education", color: "#0ea5e9", bg: "#EBF8FF" },
    { icon: "✈️", name: "Travel", color: "#6366f1", bg: "#F0EEFF" },
    { icon: "💝", name: "Gifts", color: "#ec4899", bg: "#FFF0F7" },
    { icon: "🏋️", name: "Fitness", color: "#10b981", bg: "#ECFFF7" },
    { icon: "☕", name: "Coffee", color: "#92400e", bg: "#FFF4EB" },
    { icon: "🍺", name: "Drinks", color: "#f97316", bg: "#FFF3EB" },
    { icon: "🍫", name: "Snacks", color: "#d97706", bg: "#FFF8E7" },
    { icon: "📱", name: "Phone", color: "#3b82f6", bg: "#EFF4FF" },
    { icon: "🔧", name: "Maintenance", color: "#6b7280", bg: "#F3F4F6" },
    { icon: "📦", name: "Delivery", color: "#84cc16", bg: "#F4FFE6" },
    { icon: "💄", name: "Beauty", color: "#ec4899", bg: "#FFF0F7" },
    { icon: "🎉", name: "Social", color: "#8b5cf6", bg: "#F5F0FF" },
  ],
};

const MONTHLY_DATA = [
  { month: "Jan", income: 4200, expense: 2800 },
  { month: "Feb", income: 4500, expense: 3100 },
  { month: "Mar", income: 4800, expense: 3200 },
  { month: "Apr", income: 4600, expense: 3400 },
  { month: "May", income: 5000, expense: 3600 },
  { month: "Jun", income: 4500, expense: 1800 },
];

const getCategoryDetails = (categoryName) => {
  const allCategories = [...CATEGORY_OPTIONS.expense];
  return (
    allCategories.find((cat) => cat.name === categoryName) || {
      icon: "📦",
      name: categoryName || "Other",
      color: "#6b7280",
      bg: "#F3F4F6",
    }
  );
};

export default function AnalyticsView() {
  const { transactions } = useTransactions();
  const {colors} = useAppTheme();
  const { settings } = useSettings();

  const { expensePieData, totalExpense, barChartData } = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense",
    );

    const categoryTotals = {};
    expenseTransactions.forEach((t) => {
      const category = t.category || "Other";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(t.amount);
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    );
    const totalExpense = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0,
    );

    const expensePieData = sortedCategories.map(([category, amount], index) => {
      const details = getCategoryDetails(category);
      return {
        value: amount,
        color: details.color,
        text: `${((amount / totalExpense) * 100).toFixed(0)}%`,
        label: category,
        focused: index === 0,
      };
    });

    const barChartData = [];
    MONTHLY_DATA.forEach((item) => {
      barChartData.push({
        value: item.income,
        label: item.month,
        frontColor: "#22c55e",
        spacing: 4,
      });
      barChartData.push({
        value: item.expense,
        frontColor: "#ef4444",
      });
    });

    return { expensePieData, totalExpense, barChartData };
  }, [transactions]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Box p="$5">
        <Text
          fontSize="$2xl"
          fontWeight="$bold"
          mb="$4"
          style={{
            color: colors.text,
          }}
        >
          Analytics
        </Text>

        {/* PieChart */}
        <Box
          bg="$white"
          p="$4"
          borderRadius="$2xl"
          borderWidth={1}
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            fontSize="$lg"
            fontWeight="$bold"
            mb="$4"
            style={{
              color: colors.text,
            }}
          >
            Expense Overview
          </Text>

          {expensePieData.length > 0 ? (
            <HStack space="md" alignItems="center">
              <PieChart
                donut
                data={expensePieData}
                radius={80}
                innerRadius={40}
                innerCircleColor={colors.card}
                showText
                textColor="#ffffff"
                textSize={12}
                fontWeight="bold"
                centerLabelComponent={() => (
                  <VStack alignItems="center">
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: colors.text,
                        textAlign: "center",
                      }}
                    >
                      {formatCurrency(totalExpense, settings.currency)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.subText,
                      }}
                    >
                      Total Expense
                    </Text>
                  </VStack>
                )}
              />

              <VStack flex={1} space="xs">
                {expensePieData.slice(0, 5).map((item) => (
                  <HStack
                    key={item.label}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <HStack space="xs" alignItems="center" flex={1}>
                      <Box w={10} h={10} bg={item.color} borderRadius="$sm" />
                      <Text size="xs" numberOfLines={1}>
                        {item.label}
                      </Text>
                    </HStack>
                    <VStack alignItems="flex-end">
                      <Text
                        size="xs"
                        bold
                        style={{
                          color: colors.text,
                        }}
                      >
                        {formatCurrency(item.value, settings.currency)}
                      </Text>
                      <Text
                        size="2xs"
                        style={{
                          color: colors.subText,
                        }}
                      >
                        {item.text}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </HStack>
          ) : (
            <Box py="$8" alignItems="center">
              <Text fontSize="$4xl" mb="$2">
                📊
              </Text>
              <Text
                style={{
                  color: colors.subText,
                }}
              >
                No expenses yet
              </Text>
            </Box>
          )}
        </Box>

        {/* BarChart */}
        <Box
          mt="$6"
          p="$4"
          borderRadius="$2xl"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            fontSize="$lg"
            fontWeight="$bold"
            mb="$3"
            style={{
              color: colors.text,
            }}
          >
            Income vs Expense
          </Text>

          <HStack space="md" mb="$3">
            <HStack space="xs" alignItems="center">
              <Box w={12} h={12} bg="#22c55e" />
              <Text
                size="xs"
                style={{
                  color: colors.text,
                }}
              >
                Income
              </Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w={12} h={12} bg="#ef4444" />
              <Text
                size="xs"
                style={{
                  color: colors.text,
                }}
              >
                Expense
              </Text>
            </HStack>
          </HStack>

          <BarChart
            data={barChartData}
            barWidth={16}
            spacing={20}
            hideRules
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisThickness={0}
            yAxisTextStyle={{
              fontSize: 10,
              color: colors.subText,
            }}
            xAxisLabelTextStyle={{
              fontSize: 10,
              color: colors.subText,
            }}
            noOfSections={4}
            maxValue={6000}
            isAnimated={false}
          />
        </Box>
      </Box>
    </ScrollView>
  );
}
