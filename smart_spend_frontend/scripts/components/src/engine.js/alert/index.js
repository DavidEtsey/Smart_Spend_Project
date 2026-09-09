// src/engine/alerts/index.js

/**
 * Detect unusually large transactions compared to user's normal behavior
 */
export function anomalyRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const validTransactions = transactions
    .map((tx) => ({
      ...tx,
      amount: Number(tx.amount || 0),
    }))
    .filter((tx) => Number.isFinite(tx.amount));

  if (validTransactions.length === 0) {
    return [];
  }

  const average =
    validTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    ) / validTransactions.length;

  const threshold = average * 2;

  return validTransactions
    .filter((tx) => tx.amount >= threshold)
    .map((tx) => ({
      id: `anomaly-${tx.id || tx.createdAt || "unknown"}`,
      type: "alert",
      title: "Unusual spending detected",
      message: `You spent ${tx.amount} on ${
        tx.category || "this category"
      }, which is significantly higher than your typical spending.`,
      meta: {
        amount: tx.amount,
        category: tx.category,
        date: tx.createdAt || tx.sortDate || null,
        average,
      },
    }));
}

/**
 * Detect spending spikes within a single day
 */
export function dailySpikeRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const dailyTotals = {};

  transactions.forEach((tx) => {
    // Backend provides sortDate
    const rawDate = tx.sortDate;

    if (!rawDate) {
      console.warn("Transaction has no sortDate:", tx);
      return;
    }

    const parsedDate = new Date(rawDate);

    // IMPORTANT: do not call toISOString() on an invalid date
    if (Number.isNaN(parsedDate.getTime())) {
      console.warn("Invalid transaction sortDate:", rawDate);
      return;
    }

    const day = parsedDate.toISOString().split("T")[0];

    const amount = Number(tx.amount || 0);

    if (!Number.isFinite(amount)) {
      return;
    }

    dailyTotals[day] = (dailyTotals[day] || 0) + amount;
  });

  const values = Object.values(dailyTotals);

  if (values.length === 0) {
    return [];
  }

  const dailyAverage =
    values.reduce((sum, value) => sum + value, 0) / values.length;

  const spikeThreshold = dailyAverage * 1.8;

  return Object.keys(dailyTotals)
    .filter((day) => dailyTotals[day] > spikeThreshold)
    .map((day) => ({
      id: `daily-spike-${day}`,
      type: "alert",
      title: "High spending day",
      message: `You spent ${dailyTotals[day]} on ${day}, which is higher than your usual daily spending.`,
      meta: {
        date: day,
        total: dailyTotals[day],
        dailyAverage,
      },
    }));
}

/**
 * Detect frequent small impulse purchases
 */
export function frequentSmallSpendsRule(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const SMALL_AMOUNT = 10;

  const smallSpends = transactions.filter((tx) => {
    const amount = Number(tx.amount || 0);

    return (
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= SMALL_AMOUNT
    );
  });

  if (smallSpends.length < 10) {
    return [];
  }

  return [
    {
      id: "frequent-small-spends",
      type: "insight",
      title: "Frequent small purchases",
      message:
        "You make many small purchases that can quietly add up. Reviewing these can help reduce unnecessary spending.",
      meta: {
        count: smallSpends.length,
        threshold: SMALL_AMOUNT,
      },
    },
  ];
}