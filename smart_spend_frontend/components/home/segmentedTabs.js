import { Box, HStack, Text } from "@gluestack-ui/themed";
import { Pressable } from "react-native";
import useAppTheme from "../../hooks/useAppTheme";

const tabs = ["transactions", "analytics", "categories"];

export default function SegmentedTabs({ activeTab, setActiveTab }) {
  const { colors } = useAppTheme();

  return (
    <Box
      px="$4"
      pt="$3"
      pb="$0"
      style={{
        backgroundColor: colors.header,
      }}
    >
      <HStack
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <Pressable
              key={tab}
              style={{ flex: 1 }}
              onPress={() => setActiveTab(tab)}
            >
              <Box alignItems="center">
                <Box py="$3">
                  <Text
                    fontWeight={isActive ? "$bold" : "$medium"}
                    style={{
                      color: isActive ? colors.text : colors.subText,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab}
                  </Text>
                </Box>

                <Box
                  h={3}
                  w="100%"
                  style={{
                    backgroundColor: isActive ? "#EF4444" : "transparent",
                  }}
                />
              </Box>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
