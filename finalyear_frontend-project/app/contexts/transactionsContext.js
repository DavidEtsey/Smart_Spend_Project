import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./authContext";
import { getCategoryColor } from "../../constants/categoryColors";

const TransactionContext = createContext();

export default function TransactionProvider({ children }) {
  const { isAuthenticated, authReady } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    savings: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()+1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchTransactions = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        console.log("No access token");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/transactions/${selectedMonth}/${selectedYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch transactions"
        );
      }

      console.log( "Transaction groups fetched:", Object.keys(result.transactions || {}).length + 1);

      const groupedTransactions = result.transactions || {};

      const transactionArray = Object.values(groupedTransactions)
      .flat()
      .map((tx, index) => ({
        ...tx,

        // Normalize ID
        id:
          tx.id ??
          tx.expense_id ??
          tx.income_id ??
          `transaction-${index}`,

        // Normalize date
        createdAt: tx.createdAt ?? tx.sortDate ?? tx.time,

        // Keep sortDate available
        sortDate: tx.sortDate ?? tx.createdAt ?? tx.time,

        // Normalize amount
        amount: Number(tx.amount || 0),

        // Category colors are only needed for expenses
        ...(tx.type === "expense"
          ? {
              color:
                tx.color ||
                getCategoryColor(categoryName),
            }
          : {}),
      }))
      .sort(
        (a, b) =>
          new Date(b.sortDate).getTime() -
          new Date(a.sortDate).getTime()
      );

      setTransactions(transactionArray);
      
      setSummary(
        result.summary || {
          income: 0,
          expense: 0,
          transfer: 0,
          balance: 0,
        }
      );
      
    } catch (error) {
      console.log("Fetch transactions error:", error.message);
    }
  };

  // Fetch only after auth has been confirmed
  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      setTransactions([]);
      setSummary({
        income: 0,
        expense: 0,
        balance: 0,
        savings: 0,
      });
      return;
    }

    fetchTransactions();
  }, [authReady, isAuthenticated, selectedMonth, selectedYear]);
  
  const allTransactions = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [];
  }, [transactions]);

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    sort: "newest",
    minAmount: "",
    maxAmount: "",
  });

  //Generate categories automatically and updates when the user creates new category
  const categories = useMemo(() => {
    const uniqueCategories = [
      "all",
      ...new Set(transactions.map((tx) => tx.category).filter(Boolean)),
    ];

    return uniqueCategories;
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(allTransactions))
    return []; 
  
    let result = [...allTransactions];

    // Type
    if (filters.type !== "all") {
      result = result.filter(
        (tx) => tx.type === filters.type
      );
    }

    // Category
    if (filters.category !== "all") {
      result = result.filter(
        (tx) => tx.category === filters.category
      );
    }

    // Min Amount
    if (filters.minAmount) {
      result = result.filter(
        (tx) =>
          Number(tx.amount) >=
          Number(filters.minAmount)
      );
    }

    // Max Amount
    if (filters.maxAmount) {
      result = result.filter(
        (tx) =>
          Number(tx.amount) <=
          Number(filters.maxAmount)
      );
    }

    // Sort
    switch (filters.sort) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;

      case "highest":
        result.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;

      case "lowest":
        result.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;

      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

  return result;
}, [allTransactions, filters]);

  
  const addTransaction = (tx) => {
    const transactionWithColor =
      tx.type === "expense"
        ? {
            ...tx,
            color:
              tx.color ||
              getCategoryColor(
                tx.category || "Other"
              ),
          }
        : tx;

    setTransactions((prev) => {
      const safePrev =
        Array.isArray(prev) ? prev : [];

      return [
        transactionWithColor,
        ...safePrev,
      ];
    });
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => { 
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter(
        (tx) => tx.id !== id 
      );
    });
  };

 
  const editTransaction = (updatedTx) => {
    const transactionWithColor =
      updatedTx.type === "expense"
        ? {
            ...updatedTx,
            color:
              updatedTx.color ||
              getCategoryColor(
                updatedTx.category || "Other"
              ),
          }
        : updatedTx;

    setTransactions((prev) => {
      const safePrev =
        Array.isArray(prev) ? prev : [];

      return safePrev.map((tx) =>
        tx.id === transactionWithColor.id
          ? transactionWithColor
          : tx
      );
    });
  };
  
  const restoreTransactions = (newTransactions) => {
    if (!Array.isArray(newTransactions)) {
      setTransactions([]);
      return;
    }

    const transactionsWithColors =
      newTransactions.map((tx) => {
        if (tx.type !== "expense") {
          return tx;
        }

        return {
          ...tx,
          color:
            tx.color ||
            getCategoryColor(
              tx.category || "Other"
            ),
        };
      });

    setTransactions(transactionsWithColors);
  };

  const resetTransactions = () => {
    setTransactions([]);
  };

  /*
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount || 0);

        if (tx.type === "income") {
          acc.income += amount;
        }

        if (tx.type === "expense") {
          acc.expense += amount;
        }

        if (tx.type === "transfer") {
          acc.transfer += amount;
        }

        return acc;
      },
      {
        income: 0,
        expense: 0,
        transfer: 0,
      },
    );
  }, [transactions]);

  
  const balance = totals.income - totals.expense;
  */

  //RECENT TRANSACTIONS 
  const recentTransactions = useMemo(() =>
    { if (!Array.isArray(allTransactions))
    return [];

    return allTransactions.slice(0, 5);
  }, [allTransactions]);

  const incomeTransactions = useMemo(() =>
    { if (!Array.isArray(allTransactions)) return [];
      return allTransactions.filter((tx) => tx?.type === "income"); 
    }, [allTransactions]
  );

  const expenseTransactions = useMemo(() =>
    { if (!Array.isArray(allTransactions)) return [];
      return allTransactions.filter((tx) => tx?.type === "expense");
    }, [allTransactions]
  );

  const monthlyTransactions = useMemo(() => {
    return Array.isArray(allTransactions)
    ? allTransactions : [];
  }, [allTransactions]);

  const monthlyIncomeTransactions = useMemo(() =>{
    return Array.isArray(incomeTransactions)
    ? incomeTransactions : [];
  }, [incomeTransactions]);

  const monthlyExpenseTransactions = useMemo(() =>{
    return Array.isArray(expenseTransactions)
    ? expenseTransactions : [];
  }, [expenseTransactions]);

  const monthlyIncome = useMemo(() => {
    return monthlyIncomeTransactions.reduce(
      (total, tx) => total + Number(tx.amount || 0),
      0
    );
  }, [monthlyIncomeTransactions]);

  const monthlyExpense = useMemo(() => {
    return monthlyExpenseTransactions.reduce(
      (total, tx) => total + Number(tx.amount || 0),
      0
    );
  }, [monthlyExpenseTransactions]);

 const topCategoryData = useMemo(() => {
   const categoryTotals = {};

   monthlyExpenseTransactions.forEach((tx) => {
     const category = tx.category || "Other";

     categoryTotals[category] =
       (categoryTotals[category] || 0) + Number(tx.amount || 0);
   });

   const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

   return {
     topCategory: sorted[0]?.[0] || "N/A",
     topCategoryAmount: sorted[0]?.[1] || 0,
   };
 }, [monthlyExpenseTransactions]);

 const { topCategory, topCategoryAmount } = topCategoryData;
  return (
    <TransactionContext.Provider
      value={{
        // STATE
        transactions,
        allTransactions,
        fetchTransactions,

        //FILTERED
        filteredTransactions,
        
        // ACTIONS

        addTransaction,
        deleteTransaction,
        editTransaction,
        restoreTransactions,
        resetTransactions,

        // FILTERS
        // ==========================
        filters,
        setFilters,

        categories,

        // MONTH SELECTION

        selectedMonth,
        setSelectedMonth,

        selectedYear,
        setSelectedYear,

        // MONTHLY TRANSACTIONS

        monthlyTransactions,
        monthlyIncomeTransactions,
        monthlyExpenseTransactions,

        // SUMMARY
        summary,
        totals: summary,
        balance: summary.balance,

        monthlyIncome,
        monthlyExpense,

        // QUICK DATA

        recentTransactions,
        expenseTransactions,
        incomeTransactions,

        // INSIGHTS

        topCategory,
        topCategoryAmount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
export const useTransactions = () => useContext(TransactionContext);
