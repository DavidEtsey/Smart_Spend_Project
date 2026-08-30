import { FlatList } from "react-native";
import { Box, Text } from "@gluestack-ui/themed";
import { useBudgets } from "../../app/contexts/budgetContext";
import BudgetCategoryCard from "./budgetCategoryCard";
import useAppTheme from "../../hooks/useAppTheme";


export default function BudgetList({ onBudgetPress }) {
  const { budgetSummary } = useBudgets();
  const { colors } = useAppTheme();

  if (budgetSummary.length === 0) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$8"
        py="$10"
      >
        <Text
          fontWeight="$bold"
          fontSize="$lg"
          textAlign="center"
          style={{ color: colors.text }}
        ></Text>

        <Text mt="$2" textAlign="center" style={{ color: colors.subText }}>
          Create your first budget to start tracking your spending.
        </Text>
      </Box>
    );
  }

  return (
    <FlatList
      data={budgetSummary}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListHeaderComponent={
        <Box mx="$5" mt="$6">
          <Text
            fontSize="$lg"
            fontWeight="$bold"
            style={{ color: colors.text }}
          >
            Spending by Category
          </Text>
        </Box>
      }
      renderItem={({ item }) => (
        <BudgetCategoryCard
          budget={item}
          onPress={() => onBudgetPress?.(item)}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
