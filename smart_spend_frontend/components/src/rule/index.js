
// Detects whether one category dominates spending
export function dominantCategoryRule(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const topCategory = categories.reduce((a, b) =>
    b.percentage > a.percentage ? b : a,
  );

  // Only trigger if one category clearly dominates
  if (topCategory.percentage < 40) return null;

  return {
    id: "dominant-category",
    type: "info",
    title: "Top spending category",
    message: `${topCategory.category} accounted for ${topCategory.percentage.toFixed(
      0,
    )}% of your total expenses this month, making it your largest spending category. If this is higher than expected, consider reviewing recent spending in this category.`,
    meta: {
      category: topCategory.category,
      percentage: topCategory.percentage,
    },
  };
}

// Evaluates average daily spending
export function dailyAverageRule(dailyAverage, transactionCount) {
  if (!dailyAverage || dailyAverage <= 0) return null;

  // Wait until there's enough data
  if (transactionCount < 5) return null;

  return {
    id: "daily-average",
    type: "info",
    title: "Daily spending pace",
    message: `Your average daily spending is ${dailyAverage.toFixed(
      2,
    )}. Tracking this over time can help you spot changes in your spending habits and stay within your monthly budget.`,
    meta: {
      dailyAverage,
      transactionCount,
    },
  };
}

// Detects weekend-heavy spending
export function weekendSpendingRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length < 5) return null;

  let weekendTotal = 0;
  let weekdayTotal = 0;

  transactions.forEach((tx) => {
    const day = new Date(tx.date).getDay();

    if (day === 0 || day === 6) {
      weekendTotal += tx.amount;
    } else {
      weekdayTotal += tx.amount;
    }
  });

  const total = weekendTotal + weekdayTotal;

  if (total === 0) return null;

  const weekendPercentage = (weekendTotal / total) * 100;

  // Only trigger if most spending happens on weekends
  if (weekendPercentage < 60) return null;

  return {
    id: "weekend-spending",
    type: "info",
    title: "Weekend spending habits",
    message: `${weekendPercentage.toFixed(
      0,
    )}% of your spending occurred on weekends. If this wasn't intentional, planning your weekend expenses ahead of time may help you stay within your budget.`,
    meta: {
      weekendTotal,
      weekdayTotal,
      weekendPercentage,
    },
  };
}
