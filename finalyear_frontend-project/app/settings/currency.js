import { useMemo, useState } from "react";
import { SectionList, Pressable } from "react-native";
import {
  Box,
  HStack,
  VStack,
  Text,
  Input,
  InputField,
  InputSlot,
} from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSettings } from "../contexts/settingsContext";
import useAppTheme from "../../hooks/useAppTheme";
import currencies from "../../constants/currencies";

export default function CurrencyPage() {
  const { colors } = useAppTheme();
  const { settings, updateSetting } = useSettings();

  const [search, setSearch] = useState("");

  //Search
  const filteredCurrencies = useMemo(() => {
    const text = search.toLowerCase();

    return [...currencies]
      .filter((item) => {
        return (
          item.country.toLowerCase().includes(text) ||
          item.name.toLowerCase().includes(text) ||
          item.code.toLowerCase().includes(text)
        );
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [search]);

  const sections = useMemo(() => {
    const grouped = {};

    filteredCurrencies.forEach((item) => {
      const letter = item.code[0].toUpperCase();

      if (!grouped[letter]) {
        grouped[letter] = [];
      }

      grouped[letter].push(item);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [filteredCurrencies]);
  return (
    <Box flex={1} bg={colors.card}>
      {/* HEADER */}
      <HStack
        pt="$8"
        mt="30"
        mb="$6"
        justifyContent="space-between"
        alignItems="center"
        style={{
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <HStack alignItems="center">
            <Feather name="chevron-left" size={28} color={colors.text} />

            <Text fontSize="$lg" color={colors.text}>
              Back
            </Text>
          </HStack>
        </Pressable>

        <Text fontSize="$lg" fontWeight="$medium" color={colors.text}>
          Currency Settings
        </Text>

        

        <Box width={60} />
      </HStack>
      {/* SEARCH */}
      <Box px="$4" py="$3">
        <Input
          style={{
            backgroundColor: colors.iconBg,
            borderColor: colors.border,
            borderRadius: 12,
          }}
        >
          <InputSlot pl="$3">
            <Feather name="search" size={18} color={colors.subText} />
          </InputSlot>

          <InputField
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={setSearch}
            color={colors.text}
          />
        </Input>
      </Box>
      {/* LIST */}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <Box
            px="$4"
            py="$2"
            style={{
              backgroundColor: colors.iconBg,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderTopColor: colors.border,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              fontWeight="$bold"
              style={{
                color: colors.subText,
              }}
            >
              {section.title}
            </Text>
          </Box>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              updateSetting("currency", item);
              router.back();
            }}
          >
            <HStack
              justifyContent="space-between"
              alignItems="center"
              px="$4"
              py="$4"
              borderBottomWidth={1}
              style={{
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text
                flex={1}
                style={{
                  color: colors.text,
                  fontSize: 16,
                }}
              >
                {item.code} - {item.country} ({item.symbol})
              </Text>

              {settings.currency?.code === item.code && (
                <Feather name="check" size={20} color="#22C55E" />
              )}
            </HStack>
          </Pressable>
        )}
      />
    </Box>
  );
}
