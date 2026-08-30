import { Box, Text } from "@gluestack-ui/themed";

export default function Section({ title, children, theme }) {
  return (
    <Box mb="$5">
      <Text mb="$2" fontSize="$xs" style={{ color: theme.subText }}>
        {title}
      </Text>

      <Box
        style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
