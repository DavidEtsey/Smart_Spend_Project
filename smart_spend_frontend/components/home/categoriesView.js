import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import useAppTheme from "../../hooks/useAppTheme";

export default function CategoriesView({ transactions }) {
  const { colors } = useAppTheme();

  const groupedCategories = transactions.reduce((acc, tx) => {
    const category = tx.category || "Other";

    if (!acc[category]) {
      acc[category] = {
        name: category,
        total: 0,
        count: 0,
        icon: tx.icon || "💰",
      };
    }

    acc[category].total += Number(tx.amount);
    acc[category].count += 1;

    return acc;
  }, {});

  const categories = Object.values(groupedCategories).sort(
    (a, b) => b.total - a.total,
  );

  const renderItem = ({ item }) => (
    <Box
      mx="$4"
      mb="$3"
      p="$4"
      borderRadius="$2xl"
      elevation={2}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="md" alignItems="center">
          <Box
            width={48}
            height={48}
            borderRadius={24}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: colors.iconBg,
            }}
          >
            <Text fontSize="$xl">{item.icon}</Text>
          </Box>

          <VStack>
            <Text
              fontWeight="$bold"
              fontSize="$md"
              style={{
                color: colors.text,
              }}
            >
              {item.name}
            </Text>

            <Text
              fontSize="$xs"
              style={{
                color: colors.subText,
              }}
            >
              {item.count} transaction{item.count > 1 ? "s" : ""}
            </Text>
          </VStack>
        </HStack>

        <Text
          fontWeight="$bold"
          fontSize="$md"
          style={{
            color: colors.text,
          }}
        >
          GHS {item.total.toLocaleString()}
        </Text>
      </HStack>
    </Box>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.name}
      contentContainerStyle={{
        paddingVertical: 12,
        paddingBottom: 120,
        backgroundColor: colors.bg,
      }}
      ListEmptyComponent={() => (
        <Box
          alignItems="center"
          mt="$10"
          style={{
            backgroundColor: colors.bg,
          }}
        >
          <Text
            style={{
              color: colors.subText,
            }}
          >
            No categories found
          </Text>
        </Box>
      )}
    />
  );
}
