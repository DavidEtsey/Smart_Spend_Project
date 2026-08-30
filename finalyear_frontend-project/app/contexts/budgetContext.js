import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../helpers/formatCurrency";
import { useSettings } from "./settingsContext";
import { useTransactions } from "./transactionsContext";

const BudgetContext = createContext();

export default function BudgetProvider({ children }) {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    monthlyIncome,
    monthlyExpenseTransactions,
  } = useTransactions();
  const { settings } = useSettings();

  const [budgets, setBudgets] = useState([]);

  const fetchBudgets = async () => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      console.log("No access token");
      return;
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/budgets/read`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to fetch budgets.",
      );
    }

    console.log("Budgets fetched:", result);

    setBudgets(result.data || []);
  } catch (error) {
    console.error("Fetch budgets error:", error);
  }
};

  // MONTHLY BUDGETS

  const monthlyBudgets = useMemo(() => {
    return budgets.filter(
      (budget) =>
        budget.month === selectedMonth && budget.year === selectedYear,
    );
  }, [budgets, selectedMonth, selectedYear]);

  // TOTAL BUDGET ALLOCATED

  const allocatedBudget = useMemo(() => {
    return monthlyBudgets.reduce(
      (sum, budget) => sum + Number(budget.amount || 0),
      0,
    );
  }, [monthlyBudgets]);

  // AVAILABLE INCOME

  const availableIncome = useMemo(() => {
    return monthlyIncome - allocatedBudget;
  }, [monthlyIncome, allocatedBudget]);

  // CATEGORY SUMMARY

  const budgetSummary = useMemo(() => {
    return monthlyBudgets.map((budget) => {
      const spent = monthlyExpenseTransactions
        .filter((tx) => tx.category === budget.category)
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const remaining = budget.amount - spent;

      const percentage =
        budget.amount === 0 ? 0 : (spent / budget.amount) * 100;

      let status = "good";

      if (percentage >= 100) {
        status = "danger";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        status,
      };
    });
  }, [monthlyBudgets, monthlyExpenseTransactions]);

  // TOTAL SPENT
  const totalBudgetSpent = useMemo(() => {
    return budgetSummary.reduce((sum, budget) => sum + budget.spent, 0);
  }, [budgetSummary]);

  const budgetRemaining = useMemo(() => {
    return Math.max(allocatedBudget - totalBudgetSpent, 0);
  }, [allocatedBudget, totalBudgetSpent]);

  const overallProgress = useMemo(() => {
    if (allocatedBudget === 0) return 0;

    return Math.min((totalBudgetSpent / allocatedBudget) * 100, 100);
  }, [allocatedBudget, totalBudgetSpent]);

  // BUDGET ASSISTANT
  const budgetAssistant = useMemo(() => {
    if (!settings.insights) {
      return null;
    }

    if (monthlyBudgets.length === 0) {
      return {
        title: "Budget Assistant",
        message: "Create your first budget to start tracking your spending.",
        type: "info",
      };
    }

    // Budget exceeded
    const exceeded = budgetSummary.find((budget) => budget.percentage >= 100);

    if (exceeded) {
      return {
        title: "Budget Alert",
        message: `${exceeded.category} budget exceeded by ${formatCurrency(
          Math.abs(exceeded.remaining),
          settings.currency,
        )}.`,
        type: "danger",
      };
    }

    // Almost exceeded
    const warning = budgetSummary.find((budget) => budget.percentage >= 80);

    if (warning) {
      return {
        title: "Budget Warning",
        message: `${warning.category} budget is ${Math.round(
          warning.percentage,
        )}% used.`,
        type: "warning",
      };
    }

    // Income still available
    if (availableIncome > 0) {
      return {
        title: "Budget Tip",
        message: `You still have ${formatCurrency(
          availableIncome,
          settings.currency,
        )} available to allocate.`,
        type: "success",
      };
    }
    return {
      title: "Budget Assistant",
      message: "You're staying within your budgets this month.",
      type: "success",
    };
  }, [
    monthlyBudgets,
    budgetSummary,
    availableIncome,
    settings.currency,
    settings.insights,
  ]);

  // CREATE

  const addBudget = (budget) => {
    const exists = budgets.some(
      (item) =>
        item.category_id === budget.category_id &&
        item.name === budget.name,
        item.month === budget.month &&
        item.year === budget.year,
    );

    if (exists) {
      throw new Error("A budget already exists for this category this month.");
    }

    setBudgets((prev) => [
    ...prev,
    {
      ...budget,
      amount: Number(budget.amount || 0),
      spent: Number(budget.spent || 0),
    },
  ]);
  };

  // UPDATE
  const updateBudget = (updatedBudget) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === updatedBudget.id
          ? {
              ...budget,
              ...updatedBudget,
              createdAt: budget.createdAt,
            }
          : budget,
      ),
    );
  };

  // DELETE
  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };
  const restoreBudgets = (budgets) => {
    setBudgets(budgets || []);
  };
  const resetBudgets = () => {
    setBudgets([]);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // CONTEXT VALUE
  const value = useMemo(
    () => ({
      // State
      budgets,
      monthlyBudgets,

      // Actions
      addBudget,
      updateBudget,
      deleteBudget,
      restoreBudgets,
      resetBudgets,

      // Month
      selectedMonth,
      setSelectedMonth,

      selectedYear,
      setSelectedYear,

      // Dashboard
      allocatedBudget,
      totalBudgetSpent,
      budgetRemaining,
      monthlyIncome,
      availableIncome,
      overallProgress,

      // Category cards
      budgetSummary,

      // Home Assistant
      budgetAssistant,
    }),
    [
      budgets,
      monthlyBudgets,
      selectedMonth,
      selectedYear,
      allocatedBudget,
      totalBudgetSpent,
      budgetRemaining,
      monthlyIncome,
      availableIncome,
      overallProgress,
      budgetSummary,
      budgetAssistant,
    ],
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudgets must be used within BudgetProvider.");
  }

  return context;
}
