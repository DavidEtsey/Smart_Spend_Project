import { useState } from "react";
import { useTransactions } from "../app/contexts/transactionsContext";

export default function useHomeData() {
  const { transactions, deleteTransaction } = useTransactions();

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const changeMonth = (direction) => {
    setSelectedMonth((prev) => {
      let next = prev + direction;

      if (next < 0) {
        next = 11;
        setSelectedYear((y) => y - 1);
      }

      if (next > 11) {
        next = 0;
        setSelectedYear((y) => y + 1);
      }

      return next;
    });
  };

  // Filter by selected month/year
  const filteredTransactions = (transactions || []).filter((tx) => {
    const date = new Date(tx.createdAt);

    return (
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  // Totals
  const totals = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += Number(tx.amount);
      }

      if (tx.type === "expense") {
        acc.expense += Number(tx.amount);
      }

      return acc;
    },
    {
      income: 0,
      expense: 0,
    },
  );

  const balance = totals.income - totals.expense;
  const savings = income - expense;

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const dateKey = new Date(transaction.createdAt).toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(transaction);

      return groups;
    },
    {},
  );

  const sections = Object.entries(groupedTransactions)
    .map(([title, data]) => ({
      title,
      data,
    }))
    .sort((a, b) => new Date(b.title) - new Date(a.title));

  return {
    transactions,
    filteredTransactions,
    deleteTransaction,

    selectedMonth,
    selectedYear,
    changeMonth,

    totals,
    balance,

    sections,
  };
}
