
import { useState } from "react";
import { Alert, Pressable } from "react-native";

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
import * as SecureStore from "expo-secure-store";

import useAppTheme from "../hooks/useAppTheme";

import {
  ACCOUNT_ICON_MAP,
  ACCOUNT_ICON_LABELS,
  getAccountIcon,
} from "./helpers/accountAppearance";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AddAccountPage() {
  const { colors, darkMode } = useAppTheme();

  // Get the type exactly like Add Category
  const { type } = useLocalSearchParams();

  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically generate icon from account name
  const iconType = getAccountIcon(accountName);

  const accountIcon =
    ACCOUNT_ICON_MAP[iconType] || "💰";

  const iconLabel =
    ACCOUNT_ICON_LABELS[iconType] || "Account";

  const getAuthToken = async () => {
    return await SecureStore.getItemAsync("accessToken");
  };

  const handleSave = async () => {
    const name = accountName.trim();

    if (!name || loading) return;

    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Session expired",
          "Please log in again."
        );
        return;
      }

      const generatedIcon = getAccountIcon(name);

      const response = await fetch(
        `${API_URL}/api/accounts/customize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            icon: generatedIcon,
            type,
          }),
        }
      );

      const result = await response.json();

      console.log(
        "Create account response:",
        response.status,
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to create account"
        );
      }

      router.back();
    } catch (error) {
      console.log(
        "Create account error:",
        error
      );

      Alert.alert(
        "Unable to create account",
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: darkMode
          ? "#111827"
          : "#FFFFFF",
      }}
    >
      {/* HEADER */}
      <HStack
        px="$4"
        py="$4"
        mt="$5"
        alignItems="center"
        style={{
          backgroundColor: darkMode
            ? "#111827"
            : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: darkMode
            ? "#374151"
            : "#E5E7EB",
        }}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()}>
          <HStack
            alignItems="center"
            space="xs"
          >
            <Feather
              name="chevron-left"
              size={22}
              color={
                darkMode
                  ? "#FFFFFF"
                  : "#000000"
              }
            />

            <Text
              fontSize="$md"
              style={{
                color: darkMode
                  ? "#FFFFFF"
                  : "#000000",
              }}
            >
              {type === "expense"
                ? "Expense"
                : "Income"}
            </Text>
          </HStack>
        </Pressable>

        {/* Center title */}
        <Box
          flex={1}
          alignItems="center"
        >
          <Text
            fontSize="$lg"
            fontWeight="$semibold"
            style={{
              color: darkMode
                ? "#FFFFFF"
                : "#000000",
            }}
          >
            {type === "expense"
              ? "Expense Account"
              : "Income Account"}
          </Text>
        </Box>

        <Box w={22} />
      </HStack>

      {/* BODY */}
      <VStack
        px="$4"
        pt="$6"
        space="lg"
      >
        {/* Account Name */}
        <Input
          style={{
            backgroundColor: darkMode
              ? "#1F2937"
              : "#FFFFFF",
            borderColor: darkMode
              ? "#374151"
              : "#D1D5DB",
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <InputField
            placeholder="Account Name"
            placeholderTextColor={
              darkMode
                ? "#9CA3AF"
                : "#6B7280"
            }
            value={accountName}
            onChangeText={setAccountName}
            autoCapitalize="words"
            autoCorrect={false}
            style={{
              color: darkMode
                ? "#FFFFFF"
                : "#000000",
            }}
          />
        </Input>

        {/* ACCOUNT PREVIEW */}
        <Box
          style={{
            backgroundColor: darkMode
              ? "#1F2937"
              : "#F9FAFB",
            borderColor: darkMode
              ? "#374151"
              : "#E5E7EB",
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          <HStack
            alignItems="center"
            space="md"
          >
            {/* Generated icon */}
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: darkMode
                  ? "#374151"
                  : "#E5E7EB",
              }}
            >
              <Text fontSize={25}>
                {accountIcon}
              </Text>
            </Box>

            {/* Account information */}
            <VStack
              flex={1}
              space="xs"
            >
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                numberOfLines={1}
                style={{
                  color: darkMode
                    ? "#FFFFFF"
                    : "#111827",
                }}
              >
                {accountName.trim() ||
                  "Account Name"}
              </Text>

              <Text
                fontSize="$xs"
                style={{
                  color: darkMode
                    ? "#9CA3AF"
                    : "#6B7280",
                }}
              >
                {accountName.trim()
                  ? `${iconLabel} • ${
                      type === "expense"
                        ? "Expense"
                        : "Income"
                    }`
                  : type === "expense"
                  ? "Expense account preview"
                  : "Income account preview"}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* SAVE BUTTON */}
        <Pressable
          onPress={handleSave}
          disabled={
            !accountName.trim() ||
            loading
          }
          style={{
            backgroundColor:
              colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity:
              accountName.trim() &&
              !loading
                ? 1
                : 0.5,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Creating..."
              : "Save"}
          </Text>
        </Pressable>
      </VStack>
    </Box>
  );
}

