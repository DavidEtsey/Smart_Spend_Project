import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../helpers/formatCurrency";
import { useSettings } from "./settingsContext";
import { useTransactions } from "./transactionsContext";
import { createBudget } from "../services/api";
import { useAuth } from "./authContext";

const BudgetContext = createContext(null);

export default function BudgetProvider({ children }) {
  const { isAuthenticated, authReady } = useAuth();
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

    console.log("Budgets fetched:", result.data.length);

    const normalizedBudgets = (result.data || []).map((budget) => {
      const createdDate = new Date(budget.createdAt);

      return {
        ...budget,

        category_id: Number(budget.category_id),

        amount_limit: Number(budget.amount_limit || 0),

        spent: Number(budget.spent || 0),

        color:budget.color || "No color",

        remaining: Number(
          budget.remaining ??
          Number(budget.amount_limit || 0) - Number(budget.spent || 0),
        ),

        month: createdDate.getMonth() + 1,

        year: createdDate.getFullYear(),
      };
    });
    setBudgets(normalizedBudgets);
  } catch (error) {
    console.error("Fetch budgets error:", error);
  }
};

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      setBudgets([]);
      return;
    }

    fetchBudgets();
  }, [authReady, isAuthenticated]);

  // MONTHLY BUDGETS

  const monthlyBudgets = useMemo(() => {
    return budgets.filter(
      (budget) =>
        budget.month === selectedMonth && 
        budget.year === selectedYear,
    );
  }, [budgets, selectedMonth, selectedYear]);

  // TOTAL BUDGET ALLOCATED

  const allocatedBudget = useMemo(() => {
    return monthlyBudgets.reduce(
      (sum, budget) => sum + Number(budget.amount_limit ?? budget.amount ?? 0),
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
      const spent = Number(budget.spent || 0);

      const amount = Number(budget.amount_limit || 0);

      const remaining = amount - spent;

      const percentage =
        amount === 0 ? 0 : (spent / amount) * 100;

      let status = "good";

      if (percentage >= 100) {
        status = "danger";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return {
        ...budget,

        // Convenient frontend names
        amount,
        spent,
        remaining,
        percentage,

        status,
      };
    });
  }, [monthlyBudgets]);

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
        message: `${exceeded.name} budget exceeded by ${formatCurrency(
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
        message: `${warning.name} budget is ${Math.round(
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

 //CREATE BUDGET This function receives the category and amount from AddBudgetModal.
 
  const addBudget = async (budget) => {
    try {
      //Validate Category
      if (
        !budget.category_id ||
        budget?.category_id === null) 
        {
        throw new Error("Category is required.");
      }

      const categoryId = Number(budget.category_id);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        throw new Error("Invalid category.");
      }

      //Get amount_limit from the form
      const amount = Number(
        budget.amount_limit ??
          budget.amount ??
          0,
      );

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Budget amount must be greater than zero.");
      }


      // Determine month/year
      const budgetMonth =Number(budget.month) || Number(selectedMonth);

      const budgetYear =Number(budget.year) || Number(selectedYear);

      //Prevent duplicate budget
      const exists = budgets.some(
        (item) =>
          Number(item.category_id) ===
            Number(budget.category_id) &&
          Number(item.month) === budgetMonth &&
          Number(item.year) === budgetYear
      );
      
      if (exists) {
        throw new Error(
          "A budget already exists for this category this month.",
        );
      }

      console.log("Creating budget:", {
        category_id: categoryId,
        amount_limit: amount,
      });

      //SEND REQUEST TO BACKEND
      /* Example:
      {"category_id": 8,"amount_limit": 100}
      */
      const result = await createBudget(
        categoryId,
        amount,
      );
      console.log("Budget created:", result);

      const createdBudget = 
        result?.data ??
        result?.budget ??
        result;

      if (!createdBudget) {
        throw new Error(
          "Budget was created but no budget data was returned.",
        );
      }

      // Backend returns amount as a string
      const createdAmount = Number(
        createdBudget.amount ?? amount
      );


      const newBudget = {
        ...budget,

        category_id: categoryId,

        name:
          createdBudget.name ||
          budget.name ||
          budget.category,

        category:
          createdBudget.name ||
          budget.category,

        icon:
          createdBudget.icon ||
          budget.icon ||
          budget.categoryIcon||
          "📊",

        categoryIcon:
          createdBudget.icon ||
          budget.categoryIcon||
          "#16A34A",

        amount: Number(
          createdBudget.amount ?? amount,
        ),

        amount_limit:createdAmount,

        remaining:createdAmount,

        spent: 0,

        month:
          Number(budget.month) ||
          budgetMonth,

        year:
          Number(budget.year) ||
          budgetYear,
      };

      /*
      * Add the successfully-created budget
      * to local state so the UI updates immediately.
      */
      setBudgets((prev) => [
        ...prev,
        newBudget,
      ]);

      /*
      * Return the backend response to the caller.
      */
      return result;

    } catch (error) {
      console.error(
        "Create budget error:",
        error,
      );

      throw error;
    }
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
