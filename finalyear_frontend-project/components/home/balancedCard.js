import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";
import useAppTheme from "../../hooks/useAppTheme";


export default function BalanceCard({ income=0, expense=0, balance=0 }) {
  const { colors } = useAppTheme();
  const { settings } = useSettings();

  return (
    <Box px="$4">
      <Box
        borderRadius="$3xl"
        p="$5"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={10}
        elevation={3}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        }}
      >
        {/* Total Balance */}
        <VStack alignItems="center">
          <Text
            style={{
              color: colors.subText,
            }}
          >
            Total Balance
          </Text>

          <Text
            fontSize="$4xl"
            fontWeight="$bold"
            mt="$1"
            style={{
              color: colors.text,
            }}
          >
            {formatCurrency(balance, settings.currency)}
          </Text>
        </VStack>

        {/* Statistics */}
        <HStack mt="$6" justifyContent="space-between" alignItems="center">
          {/* Income */}
          <VStack flex={1} alignItems="center">
            <Text
              fontSize="$xs"
              style={{
                color: colors.subText,
              }}
            >
              Income
            </Text>

            <Text
              fontWeight="$bold"
              style={{
                color: "#16A34A",
              }}
            >
              {formatCurrency(income, settings.currency)}
            </Text>
          </VStack>

          {/* Divider */}
          <Box
            width={1}
            height={40}
            style={{
              backgroundColor: colors.border,
            }}
          />

          {/* Expense */}
          <VStack flex={1} alignItems="center">
            <Text
              fontSize="$xs"
              style={{
                color: colors.subText,
              }}
            >
              Expense
            </Text>

            <Text
              fontWeight="$bold"
              style={{
                color: "#DC2626",
              }}
            >
              {formatCurrency(expense, settings.currency)}
            </Text>
          </VStack>

          {/* Divider */}
          <Box
            width={1}
            height={40}
            style={{
              backgroundColor: colors.border,
            }}
          />

          {/* Balance */}
          <VStack flex={1} alignItems="center">
            <Text
              fontSize="$xs"
              style={{
                color: colors.subText,
              }}
            >
              Balance
            </Text>

            <Text
              fontWeight="$bold"
              style={{
                color: "#2563EB",
              }}
            >
              {formatCurrency(balance, settings.currency)}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
}
