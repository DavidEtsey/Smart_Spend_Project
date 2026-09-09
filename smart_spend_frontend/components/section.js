import { Box, Text } from "@gluestack-ui/themed";
import useAppTheme from "../hooks/useAppTheme";


export default function Section({ title, children,  }) {
  const { colors } = useAppTheme();
  return (
    <Box mb="$5">
      <Text mb="$2" fontSize="$xs" style={{ color: colors.subText }}>
        {title}
      </Text>

      <Box
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
