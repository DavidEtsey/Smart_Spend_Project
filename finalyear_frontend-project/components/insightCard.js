import { Box, Text, VStack, HStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import useAppTheme from "../hooks/useAppTheme";
import { useSettings } from "../app/contexts/settingsContext";
import { formatCurrency } from "../app/helpers/formatCurrency";

const ICONS = {
  warning: "alert-circle",
  info: "info",
  success: "check-circle",
  tip: "lightbulb",
};

const COLORS = {
  warning: "$red600",
  info: "$blue600",
  success: "$green600",
  tip: "$teal600",
};

export default function InsightCard({ type, title, message, action, meta, rule }) {
  const { settings } = useSettings();
  const { colors } = useAppTheme();

  let displayMessage = message;

  if (!displayMessage && meta) {
    switch (rule) {
      case "anomaly":
        displayMessage = `You spent ${formatCurrency(
          meta.amount,
          settings.currency,
        )} on ${meta.category}, which is much higher than your usual spending of ${formatCurrency(
          meta.categoryAverage,
          settings.currency,
        )}.`;
        break;

      case "dailySpike":
        displayMessage = `You spent ${formatCurrency(
          meta.amount,
          settings.currency,
        )} on ${new Date(meta.date).toLocaleDateString()}, which is much higher than your daily average of ${formatCurrency(
          meta.average,
          settings.currency,
        )}.`;
        break;

      case "smallSpends":
        displayMessage = `You made ${meta.count} small purchases in ${
          meta.category
        }, totaling ${formatCurrency(
          meta.total,
          settings.currency,
        )}. Small expenses can add up over time.`;
        break;
    }
  }

  if (!type || !title || !displayMessage) {
    return null;
  }
  return (
    <Box
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      p="$5"
      borderRadius="$2xl"
      shadow={2}
      opacity={0.95}
      mb="$5"
      w="100%"
    >
      <HStack space="md" alignItems="flex-start">
        <Box
          bg={COLORS[type] || "$blue600"}
          borderRadius="$full"
          w={10}
          h={10}
          alignItems="center"
          justifyContent="center"
        >
          <Feather name={ICONS[type] || "info"} size={20} color="$white" />
        </Box>

        {/* Content */}
        <VStack flex={1} space="xs" pt="$10">
          <Text
            fontWeight="$bold"
            fontSize="$md"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          <Text
            fontSize="$sm"
            lineHeight={20}
            style={{ color: colors.subText }}
          >
            {displayMessage}
          </Text>
          {action && (
            <Text fontSize="$xs" mt="$1" color="$primary500">
              {action}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
