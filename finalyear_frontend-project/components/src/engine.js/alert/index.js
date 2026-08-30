// Detect unusually large transactions compared to the user's normal spending in the same category
export function anomalyRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length < 5) {
    return [];
  }

  // Calculate category totals and counts
  const categoryTotals = {};
  const categoryCounts = {};

  transactions.forEach((tx) => {
    const category = tx.category || "Other";
    const amount = Number(tx.amount || 0);

    categoryTotals[category] = (categoryTotals[category] || 0) + amount;

    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Calculate average spending per category
  const categoryAverages = {};

  Object.keys(categoryTotals).forEach((category) => {
    categoryAverages[category] =
      categoryTotals[category] / categoryCounts[category];
  });

  return transactions
    .filter((tx) => {
      const category = tx.category || "Other";
      const amount = Number(tx.amount || 0);

      // Need enough history before deciding what's unusual
      if (categoryCounts[category] < 3) {
        return false;
      }

      const average = categoryAverages[category];

      // Flag if transaction is at least twice the normal category average
      return amount >= average * 2;
    })
    .map((tx) => ({
      id: `anomaly-${tx.id}`,
      rule: "anomaly",
      type: "warning",
      title: "Unusual spending detected",
      meta: {
        amount: Number(tx.amount),
        category: tx.category,
        categoryAverage: categoryAverages[tx.category],
      },
    }));
}

// Detect days where spending is much higher than the user's normal daily spending
export function dailySpikeRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length < 5) {
    return [];
  }

  // Group spending by day
  const dailyTotals = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt).toISOString().split("T")[0];
    const amount = Number(tx.amount || 0);

    dailyTotals[date] = (dailyTotals[date] || 0) + amount;
  });

  const totals = Object.values(dailyTotals);

  if (totals.length < 3) {
    return [];
  }

  const average = totals.reduce((sum, value) => sum + value, 0) / totals.length;

  return Object.entries(dailyTotals)
    .filter(([_, total]) => total >= average * 2)
    .map(([date, total]) => ({
      id: `daily-spike-${date}`,
      rule: "dailySpike",
      type: "warning",
      title: "High spending day",
      message: `You spent significantly more than usual on ${new Date(
        date,
      ).toLocaleDateString()}.`,
      meta: {
        amount: total,
        average,
        date,
      },
    }));
}

// Detect many small purchases in the same category
export function frequentSmallSpendsRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length < 5) {
    return [];
  }

  const grouped = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.amount || 0);

    // Ignore larger purchases
    if (amount > 20) return;

    const category = tx.category || "Other";

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(tx);
  });

  return Object.entries(grouped)
    .filter(([_, items]) => items.length >= 5)
    .map(([category, items]) => ({
      id: `small-spends-${category}`,
      rule: "smallSpends",
      type: "tip",
      title: "Frequent small purchases",
      message: `You made ${items.length} small purchases in ${category}. They can add up over time.`,
      meta: {
        category,
        count: items.length,
        total: items.reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      },
    }));
}
