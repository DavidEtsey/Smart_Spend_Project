import { Feather } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Input,
  InputField,
  Pressable,
  Text,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AnalyticsView from "../../components/home/analyticsView";
import BalanceCard from "../../components/home/balancedCard";
import BudgetAssistant from "../../components/home/budgetAssistant";
import CategoriesView from "../../components/home/categoriesView";
import Header from "../../components/home/header";
import MonthSelector from "../../components/home/monthSelector";
import SegmentedTabs from "../../components/home/segmentedTabs";
import TransactionsView from "../../components/home/transactionsView";
import useAppTheme from "../../hooks/useAppTheme";
import { useBudgets } from "../contexts/budgetContext";
import { useSettings } from "../contexts/settingsContext";
import { useTransactions } from "../contexts/transactionsContext";
export default function Home() {
  const { colors } = useAppTheme();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchText, setSearchText] = useState("");
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  useEffect(() => {
    translateY.value = withRepeat(withTiming(-8, { duration: 1500 }), -1, true);
  }, []);

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });
  const openAdd = () => {
    scale.value = withSpring(0.85, {
      damping: 10,
    });

    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);

    router.push("trans");
  };

  const [showSearch, setShowSearch] = useState(false);
  const {
    filteredTransactions,
    deleteTransaction,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    totals
  } = useTransactions();

  const { budgetAssistant } = useBudgets();

  const displayTransactions = Array.isArray(filteredTransactions)? 
  filteredTransactions.filter((tx) => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return true;
    } 
    return ( (tx.category || "")
    .toLowerCase() .includes(query) || (tx.description || "")
    .toLowerCase() .includes(query) || String(tx.amount || "")
    .includes(query) ); })
  :[];

  const changeMonth = (direction) => {
    setSelectedMonth((prev) => {
      if (direction === -1 && prev === 1) {
        setSelectedYear((y) => y - 1);
        return 12;
      }

      if (direction === 1 && prev === 12) {
        setSelectedYear((y) => y + 1);
        return 1;
      }

      return prev + direction;
    });
  };


  const groupedTransactions = displayTransactions.reduce(
    (groups, transaction) => {
      const dateKey = new Date(transaction.createdAt).toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(transaction);

      return groups;
    },
    {},
  );

  const sections = Object.entries(groupedTransactions)
    .map(([title, data]) => ({
      title,
      data,
    }))
    .sort((a, b) => new Date(b.title) - new Date(a.title));

  const balance = totals.income - totals.expense;

  return (
    <Box
      flex={1}
      shadow={2}
      opacity={0.95}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      <Box
        style={{
          backgroundColor: colors.header,
        }}
      >
        <Header
          onSearchPress={() => setShowSearch(true)}
          onFilterPress={() => router.push("/fillters")}
        />
        <SegmentedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Box>

      <MonthSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        changeMonth={changeMonth}
      />

      <BalanceCard
        income={totals.income}
        expense={totals.expense}
        balance={balance}
        currency={settings.currency}
      />

      {/* Budget Insight */}
      {budgetAssistant && (
        <BudgetAssistant
          title={budgetAssistant.title}
          message={budgetAssistant.message}
          type={budgetAssistant.type}
          onPress={() => router.push("/(tabs)/budget")}
        />
      )}

      {/* TRANSACTIONS */}
      {activeTab === "transactions" && (
        <TransactionsView
          sections={sections}
          deleteTransaction={deleteTransaction}
        />
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <AnalyticsView transactions={displayTransactions} />
      )}

      {/* CATEGORIES */}
      {activeTab === "categories" && (
        <CategoriesView transactions={displayTransactions} />
      )}
      <Animated.View
        style={[
          fabStyle,
          {
            position: "absolute",
            right: 25,
            bottom: 30,
          },
        ]}
      >
        <Pressable onPress={openAdd}>
          <Box
            bg="$red600"
            w={60}
            h={60}
            borderRadius="$full"
            justifyContent="center"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.25}
            shadowRadius={6}
            elevation={6}
          >
            <Feather name="plus" size={28} color="white" />
          </Box>
        </Pressable>
      </Animated.View>
      {/* search modal */}
      <Modal visible={showSearch} animationType="slide" transparent>
        <Box
          flex={1}
          p="$5"
          mt="$12"
          style={{
            backgroundColor: colors.bg,
          }}
        >
          <HStack alignItems="center" space="md">
            <Box
              flex={1}
              borderRadius={12}
              px="$3"
              py="$2"
              flexDirection="row"
              alignItems="center"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                outlineStyle: "none",
                outlineWidth: 0,
                boxShadow: "none",
              }}
            >
              <Feather name="search" size={18} color={colors.subText} />
              <Input
                flex={1}
                bg="transparent"
                borderWidth={0}
                outline="none"
                ml="$2"
                style={{
                  outlineStyle: "none",
                  outlineWidth: 0,
                  boxShadow: "none",
                  borderColor: "transparent",
                }}
              >
                <InputField
                  placeholder="Search transactions..."
                  placeholderTextColor={colors.subText}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={false}
                  style={{
                    padding: 0,
                    fontSize: 16,
                    outlineStyle: "none",
                    outlineWidth: 0,
                    boxShadow: "none",
                    borderWidth: 0,
                  }}
                />
              </Input>
              {searchText.length > 0 && (
                <Pressable onPress={() => setSearchText("")}>
                  <Feather name="x-circle" size={18} color={colors.subText} />
                </Pressable>
              )}
            </Box>

            <Pressable
              onPress={() => {
                setSearchText("");
                setShowSearch(false);
              }}
            >
              <Text color="$red600" fontWeight="600" fontSize={16}>
                Cancel
              </Text>
            </Pressable>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}
