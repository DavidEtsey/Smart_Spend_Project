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
  const { filters, setFilters, categories } = useTransactions();

  const types = ["all", "income", "expense"];

  const sortOptions = [
    {
      label: "Newest First",
      value: "newest",
    },
    {
      label: "Oldest First",
      value: "oldest",
    },
    {
      label: "Highest Amount",
      value: "highest",
    },
    {
      label: "Lowest Amount",
      value: "lowest",
    },
  ];

  const RadioItem = ({ label, selected, onPress }) => (
    <Pressable onPress={onPress}>
      <HStack justifyContent="space-between" alignItems="center" py="$4">
        <Text fontSize="$md" color={colors.text}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Box flex={1} bg={colors.bg}>
        {/* Header */}
        <HStack
          px="$5"
          py="$4"
          alignItems="center"
          borderBottomWidth={1}
          borderColor={colors.border}
        >
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </HStack>

        <ScrollView
          flex={1}
          bg={colors.bg}
          contentContainerStyle={{
            flexGrow: 1,

            paddingBottom: 120,
          }}
        >
          <VStack p="$5">
            {/* Type */}
            <Box mb="$8">
              <Text
                fontSize="$lg"
                mb="$3"
                color={colors.text}
              >
                Select items you want to filter.
              </Text>

              {types.map((type) => (
                <RadioItem
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  selected={filters.type === type}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      type,
                    })
                  }
                />
              ))}
            </Box>

            {/* Category */}
            <Box mb="$8">
              <Text
                fontWeight="$bold"
                fontSize="$lg"
                mb="$3"
                color={colors.text}
              >
                Category
              </Text>

              {categories.map((category) => (
                <RadioItem
                  key={category}
                  label={category}
                  selected={filters.category === category}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      category,
                    })
                  }
                />
              ))}
            </Box>

            {/* Amount Range */}
            <Box mb="$8">
              <Text
                fontWeight="$bold"
                fontSize="$lg"
                mb="$3"
                color={colors.text}
              >
                Amount Range
              </Text>

              <HStack space="md">
                <Input flex={1}>
                  <InputField
                    keyboardType="numeric"
                    placeholder="Min"
                    value={filters.minAmount}
                    color={colors.text}
                    onChangeText={(text) =>
                      setFilters({
                        ...filters,
                        minAmount: text,
                      })
                    }
                  />
                </Input>

                <Input flex={1}>
                  <InputField
                    keyboardType="numeric"
                    placeholder="Max"
                    value={filters.maxAmount}
                    color={colors.text}
                    onChangeText={(text) =>
                      setFilters({
                        ...filters,
                        maxAmount: text,
                      })
                    }
                  />
                </Input>
              </HStack>
            </Box>

            {/* Sort */}
            <Box>
              <Text fontWeight="$bold" fontSize="$lg" mb="$3">
                Sort By
              </Text>

              {sortOptions.map((item) => (
                <RadioItem
                  key={item.value}
                  label={item.label}
                  selected={filters.sort === item.value}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      sort: item.value,
                    })
                  }
                />
              ))}
            </Box>
          </VStack>
        </ScrollView>

        {/* Bottom Action Bar */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={colors.background}
          borderTopWidth={1}
          borderColor={colors.border}
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
              <Box py="$4" bg={colors.card} borderRadius="$xl">
                <Text textAlign="center" fontWeight="$bold" color={colors.text}>
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
