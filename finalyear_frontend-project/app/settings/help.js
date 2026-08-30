import { useState } from "react";
import { ScrollView, Linking } from "react-native";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import useAppTheme from "../../hooks/useAppTheme";
import FaqCard from "../../components/settings/faqCards";

const FAQS = [
  {
    question: "How do I add a transaction?",
    answer:
      "Tap the red + button on the Home screen, choose the transaction type, enter the amount, category and other details, then save.",
  },
  {
    question: "How do budgets work?",
    answer:
      "Create  budgets for different categories. Smart Spend automatically compares your spending with your budget and warns you when you're close to or over your limit.",
  },
  {
    question: "Why am I not receiving notifications?",
    answer:
      "Make sure notifications are enabled inside Smart Spend and that your device has granted notification permission in the system settings.",
  },
  {
    question: "How do I change currency?",
    answer:
      "Open More → Settings → Currency and choose your preferred currency.",
  },
  {
    question: "Do my transactions disappear next month?",
    answer:
      "No. All transactions are permanently stored on your device. The monthly filter only changes what is displayed.",
  },
  {
    question: "Can I edit or delete a transaction?",
    answer: "Yes. Open a transaction and choose Edit or Delete.",
  },
  {
    question: "How are Smart Insights generated?",
    answer:
      "Smart Spend analyses your income, expenses, budgets and spending behaviour to generate personalized financial insights and recommendations.",
  },
];

function FAQCard({ item }) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <Box bg={colors.card} borderRadius="$xl" mb="$3" overflow="hidden">
      <Pressable onPress={() => setOpen(!open)}>
        <HStack
          px="$5"
          py="$4"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text flex={1} fontWeight="$bold" color={colors.text} mr="$3">
            {item.question}
          </Text>

          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text}
          />
        </HStack>
      </Pressable>

      {open && (
        <Box px="$5" pb="$5" borderTopWidth={1} borderColor={colors.border}>
          <Text mt="$3" color={colors.subText} lineHeight={22}>
            {item.answer}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default function HelpScreen() {
  const { colors } = useAppTheme();

  return (
    <Box flex={1} bg={colors.bg}>
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
          Help & Support
        </Text>
      </HStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <VStack space="lg">
          {/* Intro */}

          <Box bg={colors.card} borderRadius="$xl" p="$5">
            <Text fontSize="$xl" fontWeight="$bold" color={colors.text}>
              How can we help?
            </Text>

            <Text mt="$2" color={colors.subText} lineHeight={22}>
              Find answers to the most common questions about using Smart Spend.
            </Text>
          </Box>

          {/* FAQ */}

          <Box>
            {FAQS.map((item, index) => (
              <FAQCard key={index} item={item} />
            ))}
          </Box>

          {/* Contact */}

          <Box bg={colors.card} borderRadius="$xl" p="$5">
            <Text fontWeight="$bold" fontSize="$lg" color={colors.text}>
              Still need help?
            </Text>

            <Text mt="$3" color={colors.subText} lineHeight={22}>
              If your question isn&apos;t answered above, contact us at
            </Text>

            <Pressable
              mt="$2"
              onPress={() => Linking.openURL("mailto:support@smartspend.com")}
            >
              <Text color={colors.primary} fontWeight="$bold">
                support@smartspend.com
              </Text>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
}
