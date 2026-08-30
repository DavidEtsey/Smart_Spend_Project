
import { useState } from "react";
import { Pressable } from "react-native";

import {
  Box,
  HStack,
  VStack,
  Text,
  Input,
  InputField,
} from "@gluestack-ui/themed";

import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import useAppTheme from "../hooks/useAppTheme";

export default function AddCategoryPage() {
  const { colors, darkMode } = useAppTheme();

  const { type } = useLocalSearchParams();

  const [categoryName, setCategoryName] = useState("");

  const handleSave = () => {
    if (!categoryName.trim()) return;

    router.replace({
      pathname: "/trans",
      params: {
        category: JSON.stringify({
          name: categoryName.trim(),
          icon: type === "expense" ? "🛍️" : "💰",
          color: "#6b7280",
          type,
        }),
      },
    });
  };

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: darkMode ? "#111827" : "#FFFFFF",
      }}
    >
      {/* Header */}
      <HStack
        px="$4"
        py="$4"
        mt="$5"
        alignItems="center"
        style={{
          backgroundColor: darkMode ? "#111827" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: darkMode ? "#374151" : "#E5E7EB",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <HStack alignItems="center" space="xs">
            <Feather
              name="chevron-left"
              size={22}
              color={darkMode ? "#FFFFFF" : "#000000"}
            />

            <Text
              fontSize="$md"
              style={{
                color: darkMode ? "#FFFFFF" : "#000000",
              }}
            >
              {type === "expense" ? "Expense" : "Income"}
            </Text>
          </HStack>
        </Pressable>

        <Box flex={1} alignItems="center">
          <Text
            fontSize="$lg"
            fontWeight="$semibold"
            style={{
              color: darkMode ? "#FFFFFF" : "#000000",
            }}
          >
            {type === "expense"
              ? "Expense Category"
              : "Income Category"}
          </Text>
        </Box>

        <Box w={22} />
      </HStack>

      {/* Body */}
      <VStack px="$4" pt="$6" space="lg">

        <Input
          style={{
            backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            borderColor: darkMode ? "#374151" : "#D1D5DB",
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <InputField
            placeholder="Category Name"
            placeholderTextColor={
              darkMode ? "#9CA3AF" : "#6B7280"
            }
            value={categoryName}
            onChangeText={setCategoryName}
            style={{
              color: darkMode ? "#FFFFFF" : "#000000",
            }}
          />
        </Input>

        <Pressable
          onPress={handleSave}
          disabled={!categoryName.trim()}
          style={{
            backgroundColor:
              type === "expense" ? "#EF4444" : colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity: categoryName.trim() ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "600",
            }}
          >
            Save
          </Text>
        </Pressable>

      </VStack>
    </Box>
  );
}
;
