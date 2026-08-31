import { Pressable } from "react-native";
import {
  Box,
  HStack,
  VStack,
  Text,
} from "@gluestack-ui/themed";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";


export default function BudgetCategoryCard({ budget, onPress }) {
   const { colors } = useAppTheme();
   const { settings } = useSettings();
  const percentage = Math.min(budget.percentage, 100);

  return (
    <>
      <Pressable onPress={onPress}>
        <Box
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          mt="$4"
          p="$4"
          borderRadius="$2xl"
          shadowColor="$black"
          shadowOpacity={0.05}
          shadowRadius={12}
          elevation={3}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack flex={1} space="md" alignItems="center">
              <Box
                w={50}
                h={50}
                style={{
                  backgroundColor: colors.iconBg,
                }}
                borderRadius="$xl"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize="$2xl">{budget.icon}</Text>
              </Box>

              {/* Details */}

              <VStack flex={1}>
                <Text
                  fontWeight="$bold"
                  fontSize="$md"
                  style={{ color: colors.text }}
                >
                  {budget.name}
                </Text>
                <Text
                  style={{ color: colors.subText }}
                  fontSize="$xs"
                  mt="$0.5"
                >
                  {formatCurrency(budget.spent, settings.currency)} /{" "}
                  {formatCurrency(budget.amount, settings.currency)}
                </Text>

                <Box
                  mt="$2"
                  h={6}
                  style={{
                    backgroundColor: colors.border,
                  }}
                  borderRadius="$full"
                  overflow="hidden"
                >
                  <Box
                    h="$full"
                    width={`${percentage}%`}
                    bg={budget.categoryColor}
                    borderRadius="$full"
                  />
                </Box>
              </VStack>
            </HStack>

            {/* RIGHT */}

            <HStack alignItems="center" ml="$4">
              <Text
                fontWeight="$bold"
                fontSize="$md"
                color={budget.categoryColor}
                mr="$2"
              >
                {Math.round(percentage)}%
              </Text>
            </HStack>
          </HStack>
        </Box>
      </Pressable>
    </>
  );
}
