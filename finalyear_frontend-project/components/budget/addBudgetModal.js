import { Feather } from "@expo/vector-icons";
import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTransactions } from "../../app/contexts/transactionsContext";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { useBudgets } from "../../app/contexts/budgetContext";
import { useSettings } from "../../app/contexts/settingsContext";
import { formatCurrency } from "../../app/helpers/formatCurrency";
import { fetchCategories } from "../../app/services/api";
import useAppTheme from "../../hooks/useAppTheme";

import { getCategoryColor } from "../../constants/categoryColors";


export default function AddBudgetModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { settings } = useSettings();
  const { transactions } = useTransactions();

  const {
    addBudget,
    monthlyIncome,
    allocatedBudget,
    availableIncome,
    selectedMonth,
    selectedYear,
    monthlyBudgets,
  } = useBudgets();

  // Current form
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState("");

  // Budgets waiting to be saved
  const [pendingBudgets, setPendingBudgets] = useState([]);

  // Expense categories from the API
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoryError(null);

    try {
      const rows = await fetchCategories("expense");

      setCategories(
        rows.map((row) => ({
          category_id: row.category_id,
          category: row.name,
          icon: row.icon || "📦",
          color: row.color || getCategoryColor(row.name),
        })),
      );
    } catch (error) {
      setCategoryError(error.message);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Refresh every time the sheet opens so newly added categories appear.
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, loadCategories]);

  
  const expenseTotals = useMemo(() => {
    const totals = {};

    (transactions||[])
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const categoryId = Number(transaction.category_id);

        if (!categoryId) return;

        totals[categoryId] =
          (totals[categoryId] || 0) +
          (Number(transaction.amount) || 0);
      });

    return totals;
  }, [transactions]);

  /*
   * Total of budgets waiting to be saved.
   */
  const pendingTotal = useMemo(() => {
    return pendingBudgets.reduce(
      (sum, budget) => sum + Number(budget.amount || 0),
      0,
    );
  }, [pendingBudgets]);

  /*
   * Remaining income after existing budgets
   * and the budgets currently being prepared.
   */
  const remainingAfterPending = useMemo(() => {
    return availableIncome - pendingTotal;
  }, [availableIncome, pendingTotal]);

  /*
   * Check whether a category already has a budget.
   */
  const isCategoryUsed = (categoryId) => {
  // Existing saved budget
    const existsInSavedBudgets = monthlyBudgets.some(
      (budget) => Number(budget.category_id) === Number(categoryId)
    );

    // Budget waiting to be saved
    const existsInPendingBudgets = pendingBudgets.some(
      (budget) => Number(budget.category_id) === Number(categoryId)
    );

    return existsInSavedBudgets || existsInPendingBudgets;
  };

  /*
   * Add one budget to the temporary list.
   */
  const handleAddBudget = () => {
  if (!selectedCategory) {
    Alert.alert("Category Required", "Please select a category.");
    return;
  }

  const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
      return;
    }

    if (isCategoryUsed(selectedCategory.category_id)) {
      Alert.alert(
        "Category Already Used",
        `${selectedCategory.category} already has a budget for this month.`
      );
      return;
    }

    const remainingBeforeThisBudget = availableIncome - pendingTotal;

    if (numericAmount > remainingBeforeThisBudget) {
      Alert.alert(
        "Budget Exceeded",
        `Only ${formatCurrency(
          Math.max(remainingBeforeThisBudget, 0),
          settings.currency
        )} is available for another budget.`
      );
      return;
    }

    const newBudget = {
      category_id: selectedCategory.category_id,
      category: selectedCategory.category,
      categoryIcon: selectedCategory.icon,
      categoryColor:
        selectedCategory.color ||
        getCategoryColor(selectedCategory.category),
      amount: numericAmount,
      month: selectedMonth,
      year: selectedYear,
    };

    setPendingBudgets((prev) => [...prev, newBudget]);

    // Clear form for next budget
    setSelectedCategory(null);
    setAmount("");
  };

    /*
    * Remove a pending budget.
    */
    const handleRemoveBudget = (index) => {
      setPendingBudgets((prev) => prev.filter((_, i) => i !== index));
  };

  /*
   * Save all pending budgets.
   */
  const handleSaveAll = async () => {
    if (pendingBudgets.length === 0) {
      Alert.alert("No Budgets", "Please add at least one budget.");
      return;
    }

    if (pendingTotal > availableIncome) {
      Alert.alert(
        "Budget Exceeded",
        "The budgets exceed your available monthly income."
      );
      return;
    }

    try {
      for (const budget of pendingBudgets) {
        await addBudget({
          category_id: budget.category_id,
          amount_limit: budget.amount,
        });
      }

      Alert.alert(
        "Budgets Saved",
        `${pendingBudgets.length} budget${
          pendingBudgets.length > 1 ? "s" : ""
        } saved successfully.`
      );

      // Clear pending budgets
      setPendingBudgets([]);
      setSelectedCategory(null);
      setAmount("");

      // Close modal
      onClose();
    } catch (error) {
      console.error("Save All Budgets error:", error);

      Alert.alert(
        "Unable to Save",
        error?.message || "Something went wrong while saving the budgets."
      );
    }
  };
  /*
   * Close without saving pending budgets.
   */
  const handleClose = () => {
    setPendingBudgets([]);
    setSelectedCategory(null);
    setAmount("");

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Box
        flex={1}
        justifyContent="flex-end"
        style={{
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      >
        <Box
          style={{
            backgroundColor: colors.card,
            maxHeight: "92%",
          }}
          borderTopLeftRadius="$4xl"
          borderTopRightRadius="$4xl"
          p="$6"
          pb="$8"
        >
          {/* HANDLE */}

          <Box
            w={45}
            h={5}
            alignSelf="center"
            borderRadius="$full"
            mb="$5"
            style={{
              backgroundColor: colors.border,
            }}
          />

          {/* HEADER */}

          <HStack justifyContent="space-between" alignItems="center" mb="$5">
            <VStack flex={1}>
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                style={{
                  color: colors.text,
                }}
              >
                Create Budgets
              </Text>

              <Text
                fontSize="$sm"
                mt="$1"
                style={{
                  color: colors.subText,
                }}
              >
                Add budgets
              </Text>
            </VStack>

            <Pressable onPress={handleClose}>
              <Feather name="x" size={24} color={colors.subText} />
            </Pressable>
          </HStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          >
            {/* ================================= */}
            {/* PENDING BUDGETS */}
            {/* ================================= */}

            {pendingBudgets.length > 0 && (
              <Box mb="$6">
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  mb="$3"
                >
                  <Text
                    fontWeight="$bold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    Budgets to Add
                  </Text>

                  <Box
                    px="$3"
                    py="$1"
                    borderRadius="$full"
                    style={{
                      backgroundColor: colors.iconBg,
                    }}
                  >
                    <Text
                      fontSize="$sm"
                      fontWeight="$bold"
                      style={{
                        color: colors.text,
                      }}
                    >
                      {pendingBudgets.length}
                    </Text>
                  </Box>
                </HStack>

                <VStack space="sm">
                  {pendingBudgets.map((budget, index) => (
                    <Box
                      key={`${budget.category}-${index}`}
                      p="$4"
                      borderRadius="$2xl"
                      style={{
                        backgroundColor: colors.iconBg,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <HStack
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack alignItems="center" space="sm" flex={1}>
                          <Box
                            w={44}
                            h={44}
                            borderRadius="$xl"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              backgroundColor: `${budget.categoryColor}20`,
                            }}
                          >
                            <Text fontSize="$xl">{budget.categoryIcon}</Text>
                          </Box>

                          <VStack flex={1}>
                            <Text
                              fontWeight="$bold"
                              style={{
                                color: colors.text,
                              }}
                            >
                              {budget.category}
                            </Text>

                            <Text
                              fontSize="$sm"
                              mt="$1"
                              style={{
                                color: colors.subText,
                              }}
                            >
                              {formatCurrency(budget.amount, settings.currency)}
                            </Text>
                          </VStack>
                        </HStack>

                        <Pressable onPress={() => handleRemoveBudget(index)}>
                          <Box
                            w={36}
                            h={36}
                            borderRadius="$full"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              backgroundColor: "#FEE2E2",
                            }}
                          >
                            <Feather name="trash-2" size={16} color="#DC2626" />
                          </Box>
                        </Pressable>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* ================================= */}
            {/* CATEGORY */}
            {/* ================================= */}

            <Text
              fontWeight="$semibold"
              mb="$3"
              style={{
                color: colors.text,
              }}
            >
              Category
            </Text>

            {loadingCategories && categories.length === 0 && (
              <HStack alignItems="center" space="sm" mb="$5" py="$3">
                <ActivityIndicator size="small" color="#85BB65" />
                <Text fontSize="$sm" style={{ color: colors.subText }}>
                  Loading categories...
                </Text>
              </HStack>
            )}

            {!loadingCategories && categoryError && (
              <Box
                mb="$5"
                p="$4"
                borderRadius="$2xl"
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.iconBg,
                }}
              >
                <Text fontSize="$sm" style={{ color: colors.text }}>
                  {categoryError}
                </Text>

                <Pressable onPress={loadCategories} style={{ marginTop: 12 }}>
                  <HStack alignItems="center" space="sm">
                    <Feather name="refresh-cw" size={16} color="#85BB65" />
                    <Text fontWeight="$bold" style={{ color: "#85BB65" }}>
                      Try again
                    </Text>
                  </HStack>
                </Pressable>
              </Box>
            )}

            {!loadingCategories && !categoryError && categories.length === 0 && (
              <Box mb="$5" py="$3">
                <Text fontSize="$sm" style={{ color: colors.subText }}>
                  No expense categories yet.
                </Text>
              </Box>
            )}

            <HStack
              flexWrap="wrap"
              mb="$5"
              style={{
                gap: 10,
              }}
            >
              {categories.map((item) => {
                const selected = selectedCategory?.category_id === item.category_id;

                const disabled = isCategoryUsed(item.category_id);

                const categoryColor = item.color || getCategoryColor(item.category);

                return (
                  <Pressable
                    key={item.category_id}
                    disabled={disabled}
                    onPress={() => setSelectedCategory(item)}
                    style={{
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <Box
                      px="$4"
                      py="$3"
                      borderRadius="$2xl"
                      borderWidth={2}
                      style={{
                        borderColor: categoryColor,
                        backgroundColor: selected
                          ? `${categoryColor}15`
                          : colors.card,
                      }}
                    >
                      <HStack alignItems="center" space="sm">
                        <Text fontSize="$xl">{item.icon}</Text>

                        <Text
                          fontWeight="$medium"
                          style={{
                            color: colors.text,
                          }}
                        >
                          {item.category}
                        </Text>

                        {selected && (
                          <Feather
                            name="check"
                            size={16}
                            color={categoryColor}
                          />
                        )}

                        {disabled && (
                          <Feather
                            name="check-circle"
                            size={15}
                            color="#22C55E"
                          />
                        )}
                      </HStack>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>

            {/* AMOUNT */}

            <Text
              fontWeight="$semibold"
              mb="$2"
              style={{
                color: colors.text,
              }}
            >
              Budget Amount
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={`${settings.currency.symbol} 0.00`}
              placeholderTextColor={colors.subText}
              style={{
                borderWidth: 2,
                borderColor: selectedCategory
                  ? (
                      selectedCategory.color ||
                      getCategoryColor(selectedCategory.category)
                    )
                  : colors.border,
                backgroundColor: colors.iconBg,
                color: colors.text,
                borderRadius: 18,
                padding: 18,
                fontSize: 18,
                marginBottom: 14,
              }}
            />

            {/* ================================= */}
            {/* ADD ANOTHER */}
            {/* ================================= */}

            <Pressable onPress={handleAddBudget}>
              <Box
                py="$4"
                borderRadius="$2xl"
                alignItems="center"
                style={{
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "#85BB65",
                  backgroundColor: "rgba(133,187,101,0.08)",
                }}
              >
                <HStack alignItems="center" space="sm">
                  <Feather name="plus-circle" size={20} color="#85BB65" />

                  <Text
                    fontWeight="$bold"
                    style={{
                      color: "#85BB65",
                    }}
                  >
                    Add Another Budget
                  </Text>
                </HStack>
              </Box>
            </Pressable>

            {/* ================================= */}
            {/* SUMMARY */}
            {/* ================================= */}

            <Box
              mt="$6"
              borderRadius="$2xl"
              p="$5"
              style={{
                backgroundColor: colors.iconBg,
              }}
            >
              <Text
                fontWeight="$bold"
                mb="$4"
                style={{
                  color: colors.text,
                }}
              >
                Budget Summary
              </Text>

              <HStack justifyContent="space-between" mb="$3">
                <Text
                  style={{
                    color: colors.text,
                  }}
                >
                  Income
                </Text>

                <Text
                  fontWeight="$bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {formatCurrency(monthlyIncome, settings.currency)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" mb="$3">
                <Text
                  style={{
                    color: colors.text,
                  }}
                >
                  Allocated
                </Text>

                <Text
                  fontWeight="$bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {formatCurrency(allocatedBudget, settings.currency)}
                </Text>
              </HStack>

              <HStack justifyContent="space-between" mb="$3">
                <Text
                  style={{
                    color: colors.text,
                  }}
                >
                  Budgets
                </Text>

                <Text
                  fontWeight="$bold"
                  style={{
                    color:
                      pendingTotal > availableIncome ? "#DC2626" : colors.text,
                  }}
                >
                  {formatCurrency(pendingTotal, settings.currency)}
                </Text>
              </HStack>

              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginBottom: 12,
                }}
              />

              <HStack justifyContent="space-between">
                <Text
                  fontWeight="$semibold"
                  style={{
                    color: colors.text,
                  }}
                >
                  Remaining Income
                </Text>

                <Text
                  fontWeight="$bold"
                  style={{
                    color: remainingAfterPending >= 0 ? "#16A34A" : "#DC2626",
                  }}
                >
                  {formatCurrency(remainingAfterPending, settings.currency)}
                </Text>
              </HStack>
            </Box>

            {/* ================================= */}
            {/* ACTION BUTTONS */}
            {/* ================================= */}

            <HStack mt="$6" space="md">
              {/* CANCEL */}

              <Pressable
                style={{
                  flex: 1,
                }}
                onPress={handleClose}
              >
                <Box
                  py="$4"
                  borderRadius="$2xl"
                  alignItems="center"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    fontWeight="$bold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    Cancel
                  </Text>
                </Box>
              </Pressable>

              {/* SAVE ALL */}

              <Pressable
                style={{
                  flex: 1,
                  opacity: pendingBudgets.length === 0 ? 0.5 : 1,
                }}
                disabled={pendingBudgets.length === 0}
                onPress={handleSaveAll}
              >
                <Box
                  py="$4"
                  borderRadius="$2xl"
                  alignItems="center"
                  style={{
                    backgroundColor: "#85BB65",
                  }}
                >
                  <HStack alignItems="center" space="sm">
                    <Feather name="check" size={18} color="#FFFFFF" />

                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                      }}
                    >
                      Save All Budgets
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </HStack>
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
}
