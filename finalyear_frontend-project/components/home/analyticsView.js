import React, { useMemo,useEffect,useState } from "react";
import { ScrollView, Dimensions,ActivityIndicator } from "react-native";
import { Box, HStack, VStack, Text } from "@gluestack-ui/themed";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useTransactions } from "../../app/contexts/transactionsContext";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";

import { getCategoryColor } from "../../constants/categoryColors";
import { fetchAnalytics } from "../../app/services/api";

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsView() {
  const { transactions } = useTransactions();
  const {colors} = useAppTheme();
  const { settings } = useSettings();

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);

        const result = await fetchAnalytics();

        setAnalytics(result);
      } catch (error) {
        console.error("Analytics loading error:", error);

        setAnalyticsError(
          error?.message || "Unable to load analytics"
        );
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const { expensePieData, totalExpense} = useMemo(() => {
    const safeTransactions = Array.isArray(transactions)
    ? transactions
    : [];

    const expenseTransactions = safeTransactions.filter(
      (t) => t.type === "expense",
    );

    const categoryTotals = {};

    expenseTransactions.forEach((t) => {
      const category = t.category || "Other";
      const color = t.color||getCategoryColor(category);

      if (!categoryTotals[category]) {
        categoryTotals[category] = {
          amount: 0,
          color,
      };
      }

      categoryTotals[category].amount +=
        Number(t.amount) || 0;
    });

    const sortedCategories = Object.entries(
      categoryTotals
    ).sort(
      (a, b) => b[1].amount - a[1].amount
    );
    
    const totalExpense = Object.values(
      categoryTotals
    ).reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const expensePieData = sortedCategories.map(
      ([category, data], index) => {
        return {
          value: data.amount,
          // COLOR COMES FROM TRANSACTION
          color: data.color,

          text:
            totalExpense === 0
              ? "0%"
              : `${(
                  (data.amount / totalExpense) *
                  100
                ).toFixed(0)}%`,

          label: category,

          focused: index === 0,
        };
      }
    );

  return { expensePieData, totalExpense, }; }, [transactions]);  
   

  const barChartData = useMemo(() => 
    { if (
      !analytics ||
      !Array.isArray(
        analytics.barChart
      )
    ) { 
      return [];
    } 
      
   const data = []; 
  
   analytics.barChart.forEach(
    (item) => {
      data.push({
        value: Number(item.income) || 0, 
        
        label: item.month,
        
        frontColor: "#22c55e",
        spacing: 4,
      });
      
      data.push({
        value:Number(item.expense) || 0,
        frontColor: "#ef4444",
      });
    }
  ); 
  return data; }, [analytics]);
  const barChartMaxValue = useMemo(() =>{ 
    if (barChartData.length === 0) { 
      return 100; 
    } 
    
    const highestValue = 
    Math.max( 
      ...barChartData.map( 
        (item) => Number(item.value) || 0 ) ); 
    return Math.max( 
      highestValue * 1.2, 
      100 
    ); 
  }, [barChartData]);

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
          

          {/* LOADING */} 
          {analyticsLoading && 
          ( 
          <Box py="$8" alignItems="center" justifyContent="center" > 
            <ActivityIndicator size="small" color="#85BB65" /> 
            <Text mt="$3" size="sm" style={{ color: colors.subText, }} > 
              Loading analytics... 
            </Text> 
          </Box> )}

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
            maxValue={Math.max(
              ...barChartData.map((item) => item.value),
              100
            )}
            isAnimated={false}
          />
        </Box>
      </Box>
    </ScrollView>
  );
}
