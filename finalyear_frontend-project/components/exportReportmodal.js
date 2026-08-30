import { Modal } from "react-native";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import useAppTheme from "../hooks/useAppTheme";

export default function ExportTransactionsModal({
  visible,
  onClose,
  onSelect,
}) {
  const { colors } = useAppTheme();

  const options = [
    {
      id: "thisMonth",
      title: "This Month",
      subtitle: "First day to last day of this month",
      icon: "calendar",
    },
    {
      id: "lastMonth",
      title: "Last Month",
      subtitle: "Previous month's transactions",
      icon: "clock",
    },
    {
      id: "thisYear",
      title: "This Year",
      subtitle: "January to December",
      icon: "bar-chart-2",
    },
    {
      id: "lastYear",
      title: "Last Year",
      subtitle: "Previous calendar year",
      icon: "archive",
    },
    {
      id: "all",
      title: "All Transactions",
      subtitle: "Entire transaction history",
      icon: "database",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        flex={1}
        justifyContent="flex-end"
        bg="rgba(0,0,0,0.4)"
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <Box
            bg={colors.card}
            borderTopLeftRadius="$3xl"
            borderTopRightRadius="$3xl"
            p="$5"
          >
            {/* Drag Handle */}

            <Box
              alignSelf="center"
              w="$12"
              h="$1"
              borderRadius="$full"
              bg={colors.border}
              mb="$4"
            />

            <Text fontSize="$xl" fontWeight="$bold" color={colors.text} mb="$1">
              Export Transactions
            </Text>

            <Text color={colors.subText} mb="$5">
              Choose the transactions you&apos;d like to export.
            </Text>

            <VStack space="md">
              {options.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    p="$4"
                    borderRadius="$xl"
                    bg={colors.surface}
                  >
                    <HStack space="md" alignItems="center">
                      <Feather
                        name={item.icon}
                        size={22}
                        color={colors.primary}
                      />

                      <Box>
                        <Text fontWeight="$bold" color={colors.text}>
                          {item.title}
                        </Text>

                        <Text fontSize="$sm" color={colors.subText}>
                          {item.subtitle}
                        </Text>
                      </Box>
                    </HStack>

                    <Feather
                      size={20}
                      color={colors.subText}
                    />
                  </HStack>
                </Pressable>
              ))}
            </VStack>

            <Pressable onPress={onClose}>
              <Box mt="$5" p="$4" borderRadius="$xl" bg={colors.border}>
                <Text textAlign="center" fontWeight="$bold" color={colors.text}>
                  Cancel
                </Text>
              </Box>
            </Pressable>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
