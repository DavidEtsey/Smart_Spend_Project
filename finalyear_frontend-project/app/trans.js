import { Feather } from "@expo/vector-icons";
import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Calculator from "../components/calculator";
import useAppTheme from "../hooks/useAppTheme";
import { useSettings } from "./contexts/settingsContext";
import { useTransactions } from "./contexts/transactionsContext";
import { formatCurrency } from "./helpers/formatCurrency";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

// IMPORTANT:
// Android Emulator -> 10.0.2.2
// Physical Android device -> use your computer's LAN IP
// iOS Simulator -> localhost

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TYPE_CONFIG = {
  income: {
    color: "#85BB65",
    icon: "arrow-down-left",
    label: "Income",
  },

  expense: {
    color: "#ef4444",
    icon: "arrow-up-right",
    label: "Expense",
  },

  transfer: {
    color: "#3b82f6",
    icon: "repeat",
    label: "Transfer",
  },
};

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function AccountGridItem({
  item,
  index,
  NUM_COLUMNS,
  ITEM_WIDTH,
  setAccount,
  setAccountId,
  setFromAccount,
  setFromAccountId,
  setToAccount,
  setToAccountId,
  selectingField,
  setShowAccount,
}) {
  const { colors, darkMode } = useAppTheme();
  const { settings } = useSettings();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withSpring(0.94);
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };
  const isLastInRow = (index + 1) % NUM_COLUMNS === 0;

  const ACCOUNT_ICON_MAP = {
    Cash: "💵",
    cash: "💵",
    Bank: "🏦",
    bank: "🏦",
    Momo: "📱",
    momo: "📱",
    "Mobile Money": "📱",
    mobile_money: "📱",
    Savings: "🐖",
    savings: "🐖",
    Wallet: "👛",
    wallet: "👛",
    Card: "💳",
    card: "💳",
  };

  // The API stores icons as ASCII keys ("cash", "bank", "momo") rather than
  // emoji, so resolve the key first and only fall back to the account name.
  const getIcon = () => {
    if (!item.icon || item.icon === "box" || item.icon === "📁") {
      return ACCOUNT_ICON_MAP[item.name] || "💰";
    }
    return (
      ACCOUNT_ICON_MAP[item.icon] ||
      ACCOUNT_ICON_MAP[item.name] ||
      item.icon
    );
  };

  const baseStyle = {
    width: ITEM_WIDTH,
    marginRight: isLastInRow ? 0 : 12,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  };

  if (item.name === "ADD_NEW") {
    return (
      <AnimatedPressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          setShowAccount(false);
          router.push("/addAccount");
        }}
        style={[
          baseStyle,
          animatedStyle,
          {
            backgroundColor: darkMode ? colors.surface : "#F3F4F6",
            borderColor: colors.border,
            borderWidth: 1,
            borderStyle: "dashed",
          },
        ]}
      >
        <Text fontSize="$2xl">➕</Text>
        <Text mt="$2" fontSize="$xs" style={{ color: colors.text }}>
          Add
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
     onPress={() => {
  const realId = item.account_id || item.id;
  if (selectingField === "from") {
    setFromAccount(item.name);
    setFromAccountId(realId);
  } else if (selectingField === "to") {
    setToAccount(item.name);
    setToAccountId(realId);
  } else {
    setAccount(item.name);
    setAccountId(realId);
  }
  setShowAccount(false);
}}
      style={[
        baseStyle,
        animatedStyle,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          elevation: 2,
        },
      ]}
    >
      <Text fontSize="$2xl">{getIcon()}</Text>
      <Text
        mt="$2"
        fontSize="$xs"
        style={{ color: colors.text, textAlign: "center" }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      {typeof item.balance === "number" && (
        <Text
          mt="$1"
          fontSize="$xs"
          style={{ color: colors.subText, textAlign: "center" }}
          numberOfLines={1}
        >
          {formatCurrency(item.balance, settings.currency)}
        </Text>
      )}
    </AnimatedPressable>
  );
}

function CategoryGridItem({
  item,
  index,
  NUM_COLUMNS,
  ITEM_WIDTH,
  setCategory,
  setCategoryId,
  setShowCategory,
  type,
}) {
  const { colors, darkMode } = useAppTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.94);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const isLastInRow =
    (index + 1) % NUM_COLUMNS === 0;

  const baseStyle = {
    width: ITEM_WIDTH,
    marginRight: isLastInRow ? 0 : 12,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  };

  if (item.name === "ADD_NEW") {
    return (
      <AnimatedPressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          setShowCategory(false);

          router.push({
            pathname: "/addCategory",
            params: {
              type,
            },
          });
        }}
        style={[
          baseStyle,
          animatedStyle,
          {
            backgroundColor: darkMode
              ? colors.surface
              : "#F3F4F6",

            borderColor: colors.border,
            borderWidth: 1,
            borderStyle: "dashed",
          },
        ]}
      >
        <Text fontSize="$2xl">➕</Text>

        <Text
          mt="$2"
          fontSize="$xs"
          style={{
            color: colors.text,
          }}
        >
          Add
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => {
        setCategory(item.name);
        setCategoryId(item.category_id);
        setShowCategory(false);
      }}
      style={[
        baseStyle,
        animatedStyle,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          elevation: 2,
        },
      ]}
    >
      <Text fontSize="$2xl">
        {item.icon || "📁"}
      </Text>

      <Text
        mt="$2"
        fontSize="$xs"
        style={{
          color: colors.text,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </AnimatedPressable>
  );
}

export default function AddTransaction() {
  const {
    fetchTransactions,
  } = useTransactions();

  const { colors } = useAppTheme();
  const { settings } = useSettings();

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const NUM_COLUMNS =
    width < 360
      ? 2
      : width < 768
        ? 3
        : 4;

  const ITEM_WIDTH =
    (width -
      32 -
      12 * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;

  const { category: newCategoryParam } =
    useLocalSearchParams();

  const [userAccounts, setUserAccounts] =
    useState([]);

  const [backendCategories, setBackendCategories] =
    useState({
      expense: [],
      income: [],
      transfer: [],
    });

  const [userCategories, setUserCategories] =
    useState({
      expense: [],
      income: [],
      transfer: [],
    });

  const [loadingCat, setLoadingCat] =
    useState(true);

  const [showCategory, setShowCategory] =
    useState(false);

  const [showAccount, setShowAccount] =
    useState(false);

  const [showCalc, setShowCalc] =
    useState(false);

  const [type, setType] =
    useState("expense");

  const [amount, setAmount] =
    useState("0");

  const [currency, setCurrency] =
    useState("GHS");

  const [category, setCategory] =
    useState("Select");

  const [categoryId, setCategoryId] =
    useState(null);

  const [account, setAccount] =
    useState("");

  const [accountId, setAccountId] =
    useState(null);

  const [fromAccount, setFromAccount] =
    useState("");

  const [fromAccountId, setFromAccountId] =
    useState(null);

  const [toAccount, setToAccount] =
    useState("");

  const [toAccountId, setToAccountId] =
    useState(null);

  const [selectingField, setSelectingField] =
    useState(null);

  const [note, setNote] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [date] =
    useState(new Date());

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * ============================
   * GET AUTH TOKEN
   
   */

 const getAuthToken = async () => {
   try {
     const token = await SecureStore.getItemAsync("accessToken");

     if (!token) {
       console.log(" No access token found");
       return null;
     }

     return token;
   } catch (error) {
     console.log("Error reading access token:", error);
     return null;
   }
 };

  /*
   * ============================
   * HANDLE NEW CATEGORY
   * ============================
   */

  useEffect(() => {
    if (!newCategoryParam) return;

    try {
      const parsed =
        JSON.parse(newCategoryParam);

      if (
        !parsed?.type ||
        !parsed?.category_id
      ) {
        return;
      }

      setUserCategories((prev) => ({
        ...prev,
        [parsed.type]: [
          ...prev[parsed.type],
          parsed,
        ],
      }));

      setType(parsed.type);
      setCategory(parsed.name);
      setCategoryId(parsed.category_id);
    } catch (error) {
      console.log(
        "Error parsing new category:",
        error
      );
    }
  }, [newCategoryParam]);

  /*
   * ============================
   * FETCH ACCOUNTS
   * ============================
   */

  const fetchAccounts = useCallback(
    async () => {
      try {
        const token =
          await getAuthToken();

        if (!token) {
          setUserAccounts([]);
          return;
        }

        console.log(
          "Fetching accounts..."
        );

        const response =
          await fetch(
            `${API_URL}/api/accounts/view`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        console.log(
          "Accounts status:",
          response.status
        );

        if (!response.ok) {
          console.log(
            "Accounts API error:",
            result
          );

          if (response.status === 401) {
            Alert.alert(
              "Session expired",
              "Please log in again."
            );
          }

          throw new Error(
            result.message ||
              "Failed to fetch accounts"
          );
        }

        setUserAccounts(
          result.data || []
        );
      } catch (error) {
        console.log(
          "Accounts error:",
          error.message
        );
      }
    },
    []
  );

  /*
   * ============================
   * FETCH CATEGORIES
   * ============================
   */

  const fetchCategoriesByType =
    useCallback(
      async (catType) => {
        try {
          const token =
            await getAuthToken();

          if (!token) {
            return [];
          }

          const response =
            await fetch(
              `${API_URL}/api/categories/view?type=${catType}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  "Content-Type":
                    "application/json",
                },
              }
            );

          const result =
            await response.json();

          console.log(
            `${catType} status:`,
            response.status
          );

          if (!response.ok) {
            console.log(
              `${catType} category error:`,
              result
            );

            return [];
          }

          console.log(
            `${catType} categories:`,
            result.data?.length || 0
          );

          return result.data || [];
        } catch (error) {
          console.log(
            `${catType} request error:`,
            error.message
          );

          return null;
        }
      },
      []
    );

  /*
   * ============================
   * LOAD ALL CATEGORIES
   * ============================
   */

  const loadAllCategories =
    useCallback(async () => {
      setLoadingCat(true);

      try {
        const [
          expense,
          income,
          transfer,
        ] = await Promise.all([
          fetchCategoriesByType(
            "expense"
          ),

          fetchCategoriesByType(
            "income"
          ),

          fetchCategoriesByType(
            "transfer"
          ),
        ]);

        setBackendCategories((prev) => ({
          expense:
            expense !== null ? expense : prev.expense,

          income:
            income !== null ? income : prev.income,

          transfer:
            transfer !== null ? transfer : prev.transfer,
        }));
      } catch (error) {
        console.log(
          "Error loading categories:",
          error
        );
      } finally {
        setLoadingCat(false);
      }
    }, [
      fetchCategoriesByType,
    ]);

  /*
   * ============================
   * LOAD WHEN SCREEN FOCUSES
   * ============================
  */

  const [hasLoadedData, setHasLoadedData] =
  useState(false);
  
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedData) {
        const loadData = async () => {
          await Promise.all([
            fetchAccounts(),
            loadAllCategories(),
          ]);

          setHasLoadedData(true);
        };

        loadData();
      }
    }, [
      hasLoadedData,
      fetchAccounts,
      loadAllCategories,
    ])
  );

  /*
   * ============================
   * CURRENT CATEGORIES
   * ============================
   */

  const currentCategories = [
    ...(backendCategories[type] || []),

    ...(userCategories[type] || []),
  ];

  /*
   * ============================
   * VALIDATE FORM
   * ============================
   */

  const validateTransaction = () => {
    if (
      !amount ||
      Number(amount) <= 0
    ) {
      Alert.alert(
        "Invalid amount",
        "Please enter an amount greater than zero."
      );

      return false;
    }

    if (type === "transfer") {
      if (
        !fromAccountId ||
        !toAccountId
      ) {
        Alert.alert(
          "Accounts required",
          "Please select both the source and destination accounts."
        );

        return false;
      }

      if (
        fromAccountId ===
        toAccountId
      ) {
        Alert.alert(
          "Invalid transfer",
          "From and To accounts must be different."
        );

        return false;
      }
    } else {
      if (!categoryId) {
        Alert.alert(
          "Category required",
          "Please select a category."
        );

        return false;
      }

      if (!accountId) {
        Alert.alert(
          "Account required",
          "Please select an account."
        );

        return false;
      }
    }

    return true;
  };

  /*
   * ============================
   * SUBMIT TRANSACTION
   * ============================
   */

  const submitTransaction =
    async () => {
      if (!validateTransaction()) {
        return false;
      }

      const token =
        await getAuthToken();

      if (!token) {
        Alert.alert(
          "Session expired",
          "Please log in again."
        );

        return false;
      }

      let url = "";
      let body = {};

      if (type === "transfer") {
        url =
          `${API_URL}/transfer`;

        body = {
          amount:
            parseFloat(amount),

          from_account_id:
            fromAccountId,

          to_account_id:
            toAccountId,

          description:
            description || note,

          currency,
        };
      } else {
        url =
          type === "income"
            ? `${API_URL}/api/income/addIncome`
            : `${API_URL}/api/expenses/create`;

        body = {
          amount:
            parseFloat(amount),

          category_id:
            categoryId,

          account_id:
            accountId,

          description:
            description || note,

          currency,

          ...(type ===
            "expense" && {
            expense_date:
              date.toISOString(),
          }),
        };
      }

      console.log(
        "Submitting transaction:",
        body
      );

      const response =
        await fetch(url, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify(body),
        });

      const result =
        await response.json();

      if (!response.ok) {
        console.log(
          "Transaction error:",
          result
        );

        if (
          response.status === 401
        ) {
          Alert.alert(
            "Session expired",
            "Please log in again."
          );
        }

        throw new Error(
          result.message ||
            result.error ||
            "Failed to save transaction"
        );
      }

      return result;
    };

  /*
   * ============================
   * SAVE
   * ============================
   */

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result =
        await submitTransaction();

      if (!result) return;

      // Refresh transaction data
      await fetchTransactions();

      if (result.alert) {
        Alert.alert(
          "Budget Alert",
          result.alert.message
        );
      }

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================
   * CONTINUE
   * ============================
   */

  const handleContinue =
    async () => {
      setIsSaving(true);

      try {
        const result =
          await submitTransaction();

        if (!result) return;

        // Refresh transaction data
        await fetchTransactions();

        if (result.alert) {
          Alert.alert(
            "Budget Alert",
            result.alert.message
          );
        }

        setAmount("0");
        setNote("");
        setDescription("");

        if (type !== "transfer") {
          setCategory("Select");
          setCategoryId(null);

          setAccount("");
          setAccountId(null);
        } else {
          setFromAccount("");
          setFromAccountId(null);

          setToAccount("");
          setToAccountId(null);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error.message
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * ============================
   * CHANGE TYPE
   * ============================
   */

  const handleTypeChange =
    (newType) => {
      setType(newType);

      setCategory("Select");
      setCategoryId(null);

      setAccount("");
      setAccountId(null);

      setFromAccount("");
      setFromAccountId(null);

      setToAccount("");
      setToAccountId(null);
    };

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      {/* HEADER */}

      <Box
        px="$5"
        pt={insets.top}
        pb="$4"
        style={{
          backgroundColor:
            colors.header,
        }}
      >
        <HStack
          alignItems="center"
        >
          <Box flex={1}>
            <Pressable
              onPress={() =>
                router.back()
              }
            >
              <HStack
                alignItems="center"
              >
                <Feather
                  name="chevron-left"
                  size={22}
                  color={colors.text}
                />

                <Text
                  ml="$1"
                  fontWeight="$medium"
                  color={colors.text}
                >
                  Trans.
                </Text>
              </HStack>
            </Pressable>
          </Box>

          <Box
            flex={1}
            alignItems="center"
          >
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={colors.text}
            >
              {type === "expense"
                ? "Expense"
                : type === "income"
                  ? "Income"
                  : "Transfer"}
            </Text>
          </Box>

          <Box flex={1} />
        </HStack>
      </Box>

      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 24,
        }}
      >
        <Box
          bg={colors.card}
          p="$4"
        >
          {/* TYPE SELECTOR */}

          <HStack
            px="$4"
            mt="$5"
            space="sm"
          >
            {Object.keys(
              TYPE_CONFIG
            ).map((t) => {
              const active =
                type === t;

              return (
                <Pressable
                  key={t}
                  onPress={() =>
                    handleTypeChange(t)
                  }
                  style={[
                    styles.typeBtn,

                    active && {
                      borderColor:
                        TYPE_CONFIG[t]
                          .color,
                    },
                  ]}
                >
                  <Feather
                    name={
                      TYPE_CONFIG[t]
                        .icon
                    }
                    size={18}
                    color={
                      active
                        ? TYPE_CONFIG[t]
                            .color
                        : "#999"
                    }
                  />

                  <Text
                    color={
                      active
                        ? TYPE_CONFIG[t]
                            .color
                        : colors.subText
                    }
                  >
                    {
                      TYPE_CONFIG[t]
                        .label
                    }
                  </Text>
                </Pressable>
              );
            })}
          </HStack>

          {/* AMOUNT */}

          <Box
            mt="$10"
            alignItems="center"
          >
            <Pressable
              onPress={() =>
                setShowCalc(true)
              }
            >
              <VStack
                alignItems="center"
              >
                <Text
                  fontSize="$xs"
                  color={
                    colors.subText
                  }
                >
                  Tap to enter amount
                </Text>

                <Text
                  fontSize="$xl"
                  fontWeight="$bold"
                  color={
                    colors.subText
                  }
                >
                  {formatCurrency(
                    amount,
                    settings.currency
                  )}
                </Text>
              </VStack>
            </Pressable>
          </Box>

          {/* FORM */}

          <VStack
            px="$4"
            mt="$6"
            space="sm"
          >
            <FormRow label="Date">
              <View
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    colors.border,
                  minHeight: 42,
                  justifyContent:
                    "center",
                }}
              >
                <Text
                  color={colors.text}
                >
                  {formatDate(date)}
                </Text>
              </View>
            </FormRow>

            {type === "transfer" ? (
              <>
                <FormRow label="From">
                  <View
                    style={{
                      flex: 1,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colors.border,
                      minHeight: 42,
                      justifyContent:
                        "center",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setSelectingField(
                          "from"
                        );

                        setShowAccount(
                          true
                        );
                      }}
                    >
                      <Text
                        color={
                          colors.text
                        }
                      >
                        {fromAccount ||
                          "Select"}
                      </Text>
                    </Pressable>
                  </View>
                </FormRow>

                <FormRow label="To">
                  <View
                    style={{
                      flex: 1,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colors.border,
                      minHeight: 42,
                      justifyContent:
                        "center",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setSelectingField(
                          "to"
                        );

                        setShowAccount(
                          true
                        );
                      }}
                    >
                      <Text
                        color={
                          colors.text
                        }
                      >
                        {toAccount ||
                          "Select"}
                      </Text>
                    </Pressable>
                  </View>
                </FormRow>
              </>
            ) : (
              <>
                <FormRow label="Category">
                  <View
                    style={{
                      flex: 1,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colors.border,
                      minHeight: 42,
                      justifyContent:
                        "center",
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        setShowCategory(
                          true
                        )
                      }
                      style={{
                        flex: 1,
                        justifyContent:
                          "center",
                      }}
                    >
                      <Text
                        color={
                          category ===
                          "Select"
                            ? colors.subText
                            : colors.text
                        }
                      >
                        {category}
                      </Text>
                    </Pressable>
                  </View>
                </FormRow>

                <FormRow label="Account">
                  <View
                    style={{
                      flex: 1,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colors.border,
                      minHeight: 42,
                      justifyContent:
                        "center",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setSelectingField(
                          "account"
                        );

                        setShowAccount(
                          true
                        );
                      }}
                      style={{
                        flex: 1,
                        justifyContent:
                          "center",
                      }}
                    >
                      <Text
                        color={
                          account
                            ? colors.text
                            : colors.subText
                        }
                      >
                        {account ||
                          "Select"}
                      </Text>
                    </Pressable>
                  </View>
                </FormRow>
              </>
            )}

            <FormRow label="Note">
              <View
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    colors.border,
                  justifyContent:
                    "center",
                  minHeight: 40,
                }}
              >
                <TextInput
                  value={note}
                  onChangeText={
                    setNote
                  }
                  placeholder=""
                  placeholderTextColor={
                    colors.subText
                  }
                  style={{
                    color:
                      colors.text,
                    fontSize: 16,
                  }}
                />
              </View>
            </FormRow>
          </VStack>
        </Box>

        {/* DESCRIPTION + BUTTONS */}

        <Box
          mt="$4"
          px="$4"
          py="$4"
          minHeight={400}
          bg={colors.card}
        >
          <FormRow label="Description">
            <View
              style={{
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor:
                  colors.border,
                minHeight: 42,
                justifyContent:
                  "center",
              }}
            >
              <TextInput
                value={description}
                onChangeText={
                  setDescription
                }
                placeholder=""
                placeholderTextColor={
                  colors.subText
                }
                style={{
                  color:
                    colors.text,
                  fontSize: 16,
                }}
              />
            </View>
          </FormRow>

          <HStack
            mt="$6"
            space="md"
          >
            <Pressable
              style={[
                styles.saveBtn,
                {
                  backgroundColor:
                    TYPE_CONFIG[type]
                      .color,

                  opacity:
                    isSaving
                      ? 0.6
                      : 1,
                },
              ]}
              onPress={
                handleSave
              }
              disabled={
                isSaving
              }
            >
              <Text
                color="$white"
                fontWeight="$semibold"
              >
                {isSaving
                  ? "Saving..."
                  : "Save"}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.continueBtn,
                {
                  borderColor:
                    colors.border,
                  opacity:
                    isSaving
                      ? 0.6
                      : 1,
                },
              ]}
              onPress={
                handleContinue
              }
              disabled={
                isSaving
              }
            >
              <Text
                color={
                  colors.text
                }
                fontWeight="$semibold"
              >
                Continue
              </Text>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>

      {/* CALCULATOR */}

      {showCalc && (
        <Calculator
          value={amount}
          currency={currency}
          onChange={setAmount}
          onCurrencyChange={
            setCurrency
          }
          onClose={() =>
            setShowCalc(false)
          }
        />
      )}

      {/* CATEGORY MODAL */}

      <Modal
        transparent
        animationType="slide"
        visible={showCategory}
        onRequestClose={() =>
          setShowCategory(false)
        }
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor:
              colors.overlay,
          }}
          onPress={() =>
            setShowCategory(false)
          }
        />

        <Box
          style={{
            position:
              "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor:
              colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "70%",
            overflow: "hidden",
          }}
        >
          <HStack
            px="$4"
            py="$3"
            justifyContent="space-between"
            alignItems="center"
            style={{
              backgroundColor:
                TYPE_CONFIG[type]
                  .color,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text
              fontWeight="$semibold"
              color="$white"
            >
              {type === "expense"
                ? "Expense Category"
                : "Income Category"}
            </Text>

            <Pressable
              onPress={() =>
                setShowCategory(false)
              }
            >
              <Feather
                name="x"
                size={22}
                color="white"
              />
            </Pressable>
          </HStack>

          {loadingCat ? (
            <Text
              style={{
                padding: 20,
                textAlign:
                  "center",
                color:
                  colors.text,
              }}
            >
              Loading...
            </Text>
          ) : (
            <FlatList
              data={[
                ...currentCategories,
                {
                  category_id:
                    "add-new",
                  name:
                    "ADD_NEW",
                  icon:
                    "➕",
                },
              ]}
              keyExtractor={(
                item
              ) =>
                item.category_id
                  ? String(
                      item.category_id
                    )
                  : item.name
              }
              numColumns={
                NUM_COLUMNS
              }
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingTop: 12,
                paddingBottom: 20,
              }}
              columnWrapperStyle={{
                marginBottom: 12,
              }}
              renderItem={({
                item,
                index,
              }) => (
                <CategoryGridItem
                  item={item}
                  index={index}
                  NUM_COLUMNS={
                    NUM_COLUMNS
                  }
                  ITEM_WIDTH={
                    ITEM_WIDTH
                  }
                  setCategory={
                    setCategory
                  }
                  setCategoryId={
                    setCategoryId
                  }
                  setShowCategory={
                    setShowCategory
                  }
                  type={type}
                />
              )}
            />
          )}
        </Box>
      </Modal>

      {/* ACCOUNT MODAL */}

      <Modal
        transparent
        animationType="slide"
        visible={showAccount}
        onRequestClose={() =>
          setShowAccount(false)
        }
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor:
              colors.overlay,
          }}
          onPress={() =>
            setShowAccount(false)
          }
        />

        <Box
          style={[
            styles.modalSheet,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <HStack
            px="$3"
            py="$1.5"
            justifyContent="space-between"
            alignItems="center"
            style={{
              backgroundColor:
                "#85BB65",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text
              fontWeight="$semibold"
              color="$white"
            >
              Select Account
            </Text>

            <Pressable
              onPress={() =>
                setShowAccount(false)
              }
            >
              <Feather
                name="x"
                size={22}
                color="white"
              />
            </Pressable>
          </HStack>

          <Box mt="$4">
            <FlatList
              data={[
                ...userAccounts,
                {
                  name:
                    "ADD_NEW",
                  icon:
                    "➕",
                },
              ]}
              keyExtractor={(item) => String(item.account_id || item.id || item.name)}
              numColumns={
                NUM_COLUMNS
              }
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingTop: 12,
                paddingBottom: 20,
              }}
              columnWrapperStyle={{
                marginBottom: 12,
              }}
              renderItem={({
                item,
                index,
              }) => (
                <AccountGridItem
                  item={item}
                  index={index}
                  NUM_COLUMNS={
                    NUM_COLUMNS
                  }
                  ITEM_WIDTH={
                    ITEM_WIDTH
                  }
                  setAccount={
                    setAccount
                  }
                  setAccountId={
                    setAccountId
                  }
                  setFromAccount={
                    setFromAccount
                  }
                  setFromAccountId={
                    setFromAccountId
                  }
                  setToAccount={
                    setToAccount
                  }
                  setToAccountId={
                    setToAccountId
                  }
                  selectingField={
                    selectingField
                  }
                  setShowAccount={
                    setShowAccount
                  }
                />
              )}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

function FormRow({
  label,
  children,
}) {
  const { colors } =
    useAppTheme();

  return (
    <Box>
      <HStack
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          color={colors.subText}
          w={90}
        >
          {label}
        </Text>

        <HStack flex={1}>
          {children}
        </HStack>
      </HStack>
    </Box>
  );
}

const styles =
  StyleSheet.create({
    typeBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      borderColor: "#eee",
    },

    saveBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      elevation: 3,
    },

    continueBtn: {
      flex: 1,
      backgroundColor:
        "transparent",
      borderWidth: 1,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      elevation: 3,
    },

    modalSheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: "75%",
      elevation: 10,
    },
  });