import { ScrollView } from "react-native";
import { Box, Pressable } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import BudgetHeader from "../../components/budget/budgetHeader";
import BudgetOverviewCard from "../../components/budget/budgetOverviewCard";
import InsightCard from "../../components/budget/smartInsightCard";
import BudgetList from "../../components/budget/budgetList";
import AddBudgetModal from "../../components/budget/addBudgetModal";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../contexts/settingsContext";

export default function BudgetPage() {
  const { colors } = useAppTheme();
  const {settings} = useSettings();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      <ScrollView
        style={{
          backgroundColor: colors.bg,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BudgetHeader />
        <BudgetOverviewCard />
        <BudgetList
          onBudgetPress={(budget) => {
            console.log(budget);
          }}
        />
        {settings.insights && <InsightCard />}
      </ScrollView>

      <Pressable
        position="absolute"
        bottom={30}
        right={20}
        onPress={() => setModalVisible(true)}
      >
        <Box
          w={60}
          h={60}
          borderRadius="$full"
          bg="$green500"
          justifyContent="center"
          alignItems="center"
          shadowColor="$black"
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={5}
        >
          <Feather name="plus" size={30} color="white" />
        </Box>
      </Pressable>

      <AddBudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </Box>
  );
}
