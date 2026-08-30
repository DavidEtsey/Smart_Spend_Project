import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { Alert, Pressable, SectionList } from "react-native";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";
import useAppTheme from "../../hooks/useAppTheme";

export default function TransactionsView({ sections, deleteTransaction }) {
  const { colors } = useAppTheme();
  const { settings } = useSettings();

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (date.toDateString() === today.toDateString()) {
      return `TODAY - ${formattedDate}`;
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `YESTERDAY - ${formattedDate}`;
    }

    return `${date
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase()} - ${formattedDate}`;
  };

  const renderItem = ({ item }) => {
    let amountColor;
    let prefix = "";

    if (item.type === "income") {
      amountColor = "#16A34A";
      prefix = "+";
    } else if (item.type === "expense") {
      amountColor = "#DC2626";
      prefix = "-";
    } else {
      amountColor = "#2563EB";
      prefix = "";
    }

    return (
      <Pressable onLongPress={() => handleDelete(item.id)}>
        <Box
          p="$4"
          mx="$4"
          mb="$3"
          borderRadius="$2xl"
          elevation={2}
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="md" flex={1}>
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
                <Text fontSize="$xl">{item.icon || "💰"}</Text>
              </Box>

              <VStack flex={1}>
                <Text
                  fontWeight="$semibold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {item.category}
                </Text>

                <Text
                  fontSize="$xs"
                  style={{
                    color: colors.subText,
                  }}
                >
                  {item.description || "No description"}
                </Text>

                <Text
                  fontSize="$xs"
                  style={{
                    color: colors.subText,
                  }}
                >
                  {item.account}
                </Text>
              </VStack>
            </HStack>

            <VStack alignItems="flex-end">
              <Text
                fontWeight="$bold"
                style={{
                  color: amountColor,
                }}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount, settings.currency)}
              </Text>

              <Text
                fontSize="$xs"
                style={{
                  color: colors.subText,
                }}
              >
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item, index) =>
          String(item.id ?? item.expense_id ?? item.income_id ?? `transaction-${index}`)
        }
        renderItem={renderItem}
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingBottom: 120,
          backgroundColor: colors.bg,
        }}
        renderSectionHeader={({ section }) => (
          <Box
            px="$4"
            py="$2"
            style={{
              backgroundColor: colors.bg,
            }}
          >
            <Text
              fontSize="$sm"
              fontWeight="$bold"
              style={{
                color: colors.subText,
              }}
            >
              {getDateLabel(section.title)}
            </Text>
          </Box>
        )}
      />
    </Box>
  );
}
