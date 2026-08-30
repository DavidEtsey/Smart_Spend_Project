import { ScrollView } from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Heading,
} from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import useAppTheme from "../../hooks/useAppTheme";
import { useSettings } from "../contexts/settingsContext";

export default function AboutScreen() {
  const { colors } = useAppTheme();

  const appVersion =
    Constants.expoConfig?.version || Constants.manifest?.version || "1.0.0";

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      {/* Header */}

      <HStack
        px="$5"
        pt="$12"
        pb="$4"
        alignItems="center"
        borderBottomWidth={1}
        borderColor={colors.border}
        bg={colors.header}
      >
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>

        <Text ml="$3" fontSize="$xl" fontWeight="$bold" color={colors.text}>
          About
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="xl" p="$5">
          <Box p="$6" borderRadius="$xl" bg={colors.card} alignItems="center">
            {/* Logo */}
            <Heading
              size="$2xl"
              color="#85BB65"
              fontWeight="$extrabold"
              letterSpacing={2}
            >
              Smart
              <Text fontStyle="italic" color="#FFDD00">
                Spend
              </Text>
            </Heading>
            <Text mt="$2" color={colors.subText}>
              Version {appVersion}
            </Text>
          </Box>

          {/* Description */}

          <Box p="$5" borderRadius="$xl" bg={colors.card}>
            <Text fontWeight="$bold" fontSize="$lg" color={colors.text}>
              What is Smart Spend?
            </Text>

            <Text mt="$3" lineHeight={22} color={colors.subText}>
              Smart Spend is an expense tracker that helps you manage your
              personal finances by recording income and expenses, creating
              budgets, analysing spending habits and providing smart insights
              that help you make better financial decisions.
            </Text>
          </Box>

          {/* Features */}

          <Box p="$5" borderRadius="$xl" bg={colors.card}>
            <Text fontWeight="$bold" fontSize="$lg" color={colors.text}>
              Features
            </Text>

            <VStack mt="$4" space="md">
              <HStack space="md" alignItems="center">
                <Feather name="dollar-sign" color="#85BB65" size={18} />
                <Text color={colors.text}>Track income and expenses</Text>
              </HStack>

              <HStack space="md" alignItems="center">
                <Feather name="pie-chart" color="#85BB65" size={18} />
                <Text color={colors.text}>Budget Planning</Text>
              </HStack>

              <HStack space="md" alignItems="center">
                <Feather name="bar-chart-2" color="#85BB65" size={18} />
                <Text color={colors.text}>Analytics</Text>
              </HStack>

              <HStack space="md" alignItems="center">
                <Feather name="activity" color="#85BB65" size={18} />
                <Text color={colors.text}>Smart financial insights</Text>
              </HStack>
              <HStack space="md" alignItems="center">
                <Feather name="globe" color="#85BB65" size={18} />
                <Text color={colors.text}>Multiple Currencies</Text>
              </HStack>

              <HStack space="md" alignItems="center">
                <Feather name="bell" color="#85BB65" size={18} />
                <Text color={colors.text}>Daily reminder notifications</Text>
              </HStack>
            </VStack>
          </Box>
          <Box p="$5" borderRadius="$xl" bg={colors.card}>
            <Text fontWeight="$bold" fontSize="$lg" color={colors.text}>
              App Information
            </Text>
            <VStack mt="$4" space="sm">
              <HStack justifyContent="space-between">
                <Text color={colors.subText}>Version</Text>
                <Text color={colors.text}>{appVersion}</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text color={colors.subText}>Platform</Text>
                <Text color={colors.text}>React Native (Expo)</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text color={colors.subText}>Build</Text>
                <Text color={colors.text}>Production</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Developer */}

          <Box p="$5" borderRadius="$xl" bg={colors.card}>
            <Text fontWeight="$bold" fontSize="$lg" color={colors.text}>
              Development Team
            </Text>

            <Text mt="$3" color={colors.subText} lineHeight={22}>
              SmartSpend is a collaborative project designed to make personal
              finance management simple and accessible. The application combines
              intuitive design with intelligent financial features to help users
              make informed spending decisions.
            </Text>

            <VStack mt="$4" space="sm">
              <HStack justifyContent="space-between">
                <Text color={colors.subText}>Frontend</Text>
                <Text color={colors.text}>Princess Benson</Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text color={colors.subText}>Backend</Text>
                <Text color={colors.text}>David Asem</Text>
              </HStack>
            </VStack>
          </Box>
          {/* Footer */}

          <Text textAlign="center" mb="$10" color={colors.subText}>
            © {new Date().getFullYear()} Expense Tracker
          </Text>
        </VStack>
      </ScrollView>
    </Box>
  );
}
