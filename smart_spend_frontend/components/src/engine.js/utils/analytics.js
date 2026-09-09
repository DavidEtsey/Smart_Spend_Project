
export function calculateSpendingStats(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      totalSpent: 0,
      dailyAverage: 0,
      transactionAverage: 0,
      mostExpensiveDay: null,
    };
  }

  // Total spent
  const expenseTransactions = transactions.filter(
    (tx) => tx.type === "expense",
  );

  const totalSpent = expenseTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );
  // Unique days spent
  const uniqueDays = new Set(
    transactions
      .map((tx) => tx.createdAt || tx.date)
      .filter(Boolean)
      .map((date) => date.split("T")[0]),
  );

  const dailyAverage = uniqueDays.size > 0 ? totalSpent / uniqueDays.size : 0;

  const transactionAverage = totalSpent / transactions.length;

  // Spending per weekday
  const dayTotals = {};
  expenseTransactions.forEach((tx) => {
    const day = new Date(tx.createdAt || tx.date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    dayTotals[day] = (dayTotals[day] || 0) + tx.amount;
  });

  const mostExpensiveDay = Object.keys(dayTotals).reduce(
    (maxDay, currentDay) =>
      dayTotals[currentDay] > dayTotals[maxDay] ? currentDay : maxDay,
    Object.keys(dayTotals)[0],
  );

  return {
    totalSpent,
    dailyAverage,
    transactionAverage,
    mostExpensiveDay,
  };
}

/**
 * Calculate statistics per category
 */
export function calculateCategoryStats(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const totalSpent = transactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const categoryMap = {};

  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const category = tx.category || "Other";

      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = [];
      }

      categoryMap[tx.category].push(Number(tx.amount || 0));
    });

  return Object.keys(categoryMap).map((category) => {
    const amounts = categoryMap[category];
    const total = amounts.reduce((a, b) => a + b, 0);

    return {
      category,
      total,
      average: amounts.length ? total / amounts.length : 0,
      percentage: totalSpent ? (total / totalSpent) * 100 : 0,
      count: amounts.length,
    };
  });
}

/**
 * Get daily spending series (for charts)
 */
export function getDailySpendSeries(transactions) {
  if (!Array.isArray(transactions)) return [];

  const dailyMap = {};

  transactions.forEach((tx) => {
    const txDate = tx.createdAt || tx.date;

    if (!txDate) return;

    const day = txDate.split("T")[0];

    dailyMap[day] = (dailyMap[day] || 0) + Number(tx.amount || 0);
  });
}

/**
 * Calculate rolling average for adaptive anomaly detection
 */
export function calculateRollingAverage(transactions, window = 14) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return 0;
  }

  const recent = transactions.slice(-window);
  const total = recent.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return recent.length ? total / recent.length : 0;
}
