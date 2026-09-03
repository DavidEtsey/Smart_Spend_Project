import { Feather } from "@expo/vector-icons";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Input,
  InputField,
  ScrollView,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "./contexts/transactionsContext";
import useAppTheme from "../hooks/useAppTheme";

export default function FiltersScreen() {
  const { colors } = useAppTheme();
  const {
    filters,
    setFilters,
    categories,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  } = useTransactions();

  const types = ["all", "income", "expense"];
  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Highest Amount", value: "highest" },
    { label: "Lowest Amount", value: "lowest" },
  ];

  const changeMonth = (dir) => {
    if (dir === -1) {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const monthLabel = new Date(
    selectedYear,
    selectedMonth - 1,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const RadioItem = ({ label, selected, onPress }) => (
    <Pressable onPress={onPress}>
      <HStack justifyContent="space-between" alignItems="center" py="$4">
        <Text
          fontSize="$md"
          style={{ color: colors.text }}
          textTransform="capitalize"
        >
          {label}
        </Text>
        <Box
          w={22}
          h={22}
          borderRadius="$full"
          borderWidth={2}
          borderColor={selected ? "#85BB65" : colors.border}
          justifyContent="center"
          alignItems="center"
        >
          {selected && <Box w={10} h={10} borderRadius="$full" bg="#85BB65" />}
        </Box>
      </HStack>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <Box flex={1} style={{ backgroundColor: colors.bg }}>
        <HStack
          px="$5"
          py="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          style={{ borderColor: colors.border }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="x" size={26} color={colors.text} />
          </Pressable>

          <HStack alignItems="center" space="$2">
            <Pressable onPress={() => changeMonth(-1)} hitSlop={10} px="$1">
              <Feather name="chevron-left" size={26} color={colors.text} />
            </Pressable>
            <Text fontSize="$lg" style={{ color: colors.text }}>
              {monthLabel}
            </Text>
            <Pressable onPress={() => changeMonth(1)} hitSlop={10} px="$1">
              <Feather name="chevron-right" size={26} color={colors.text} />
            </Pressable>
          </HStack>
        </HStack>

        <ScrollView
          flex={1}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack p="$5">
            <Box mb="$8">
              <Text fontSize="$md" mb="$3" style={{ color: colors.subText }}>
                Select items you want to filter.
              </Text>
              {types.map((t) => (
                <RadioItem
                  key={t}
                  label={t}
                  selected={filters.type === t}
                  onPress={() => setFilters({ ...filters, type: t })}
                />
              ))}
            </Box>
            <Box mb="$8">
              <Text
                fontWeight="$bold"
                fontSize="$lg"
                mb="$3"
                style={{ color: colors.text }}
              >
                Category
              </Text>
              {categories.map((c) => (
                <RadioItem
                  key={c}
                  label={c}
                  selected={filters.category === c}
                  onPress={() => setFilters({ ...filters, category: c })}
                />
              ))}
            </Box>
            <Box mb="$8">
              <Text
                fontWeight="$bold"
                fontSize="$lg"
                mb="$3"
                style={{ color: colors.text }}
              >
                Amount Range
              </Text>
              <HStack space="md">
                <Input
                  flex={1}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                  }}
                >
                  <InputField
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor={colors.subText}
                    value={filters.minAmount}
                    style={{ color: colors.text }}
                    onChangeText={(text) =>
                      setFilters({ ...filters, minAmount: text })
                    }
                  />
                </Input>
                <Input
                  flex={1}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                  }}
                >
                  <InputField
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={colors.subText}
                    value={filters.maxAmount}
                    style={{ color: colors.text }}
                    onChangeText={(text) =>
                      setFilters({ ...filters, maxAmount: text })
                    }
                  />
                </Input>
              </HStack>
            </Box>
            <Box>
              <Text
                fontWeight="$bold"
                fontSize="$lg"
                mb="$3"
                style={{ color: colors.text }}
              >
                Sort By
              </Text>
              {sortOptions.map((item) => (
                <RadioItem
                  key={item.value}
                  label={item.label}
                  selected={filters.sort === item.value}
                  onPress={() => setFilters({ ...filters, sort: item.value })}
                />
              ))}
            </Box>
          </VStack>
        </ScrollView>

        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          style={{
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
          px="$5"
          py="$4"
        >
          <HStack space="md">
            <Pressable
              flex={1}
              onPress={() =>
                setFilters({
                  type: "all",
                  category: "all",
                  sort: "newest",
                  minAmount: "",
                  maxAmount: "",
                })
              }
            >
              <Box
                py="$4"
                borderRadius="$xl"
                borderWidth={1}
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text
                  textAlign="center"
                  fontWeight="$bold"
                  style={{ color: colors.text }}
                >
                  Reset
                </Text>
              </Box>
            </Pressable>
            <Pressable flex={2} onPress={() => router.back()}>
              <Box py="$4" bg="#85BB65" borderRadius="$xl">
                <Text color="$white" textAlign="center" fontWeight="$bold">
                  Apply Filters
                </Text>
              </Box>
            </Pressable>
          </HStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
