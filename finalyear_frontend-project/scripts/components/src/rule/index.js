// src/engine/rules/index.js

/**
 * Detects if one category dominates spending
 */
export function dominantCategoryRule(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const topCategory = categories.reduce((a, b) =>
    b.percentage > a.percentage ? b : a,
  );

  // Trigger only if category is clearly dominant
  if (topCategory.percentage < 40) return null;

  return {
    id: "dominant-category",
    type: "warning",
    title: "Spending focus detected",
    message: `You spent ${topCategory.percentage.toFixed(
      0,
    )}% of your money on ${topCategory.category}. Consider whether this aligns with your financial goals.`,
    meta: {
      category: topCategory.category,
      percentage: topCategory.percentage,
    },
  };
}

/**
 * Evaluates daily average spending
 */
export function dailyAverageRule(dailyAverage) {
  if (!dailyAverage || dailyAverage <= 0) return null;

  // Soft threshold (can be tuned later)
  if (dailyAverage < 50) return null;

  return {
    id: "daily-average",
    type: "info",
    title: "Daily spending pattern",
    message: `On average, you spend about ${dailyAverage.toFixed(
      2,
    )} per day. Keeping an eye on daily habits can help improve savings.`,
    meta: {
      dailyAverage,
    },
  };
}

/**
 * Detects weekend-heavy spending
 */
export function weekendSpendingRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;

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

  if (weekendTotal <= weekdayTotal) return null;

  return {
    id: "weekend-spending",
    type: "insight",
    title: "Weekend spending trend",
    message:
      "You tend to spend more on weekends than weekdays. Planning ahead for weekends may help reduce impulse spending.",
    meta: {
      weekendTotal,
      weekdayTotal,
    },
  };
}
