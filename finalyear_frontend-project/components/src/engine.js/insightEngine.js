import {
  calculateCategoryStats,
  calculateSpendingStats,
} from "./utils/analytics";

import { dominantCategoryRule, dailyAverageRule } from "../rule";

import { anomalyRule, dailySpikeRule, frequentSmallSpendsRule } from "./alert";

export function generateInsights(transactions) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Only analyze expenses
  const expenseTransactions = transactions.filter(
    (tx) => tx.type === "expense",
  );

  if (expenseTransactions.length === 0) {
    return [];
  }

  const categories = calculateCategoryStats(expenseTransactions);

  const stats = calculateSpendingStats(expenseTransactions);

  const insights = [];

  const dominant = dominantCategoryRule(categories);
  if (dominant) insights.push(dominant);

  const daily = dailyAverageRule(stats.dailyAverage);
  if (daily) insights.push(daily);

  insights.push(...anomalyRule(expenseTransactions));
  insights.push(...dailySpikeRule(expenseTransactions));
  insights.push(...frequentSmallSpendsRule(expenseTransactions));

 return insights.sort((a, b) => {
   const priority = {
     warning: 1,
     alert: 2,
     info: 3,
     tip: 4,
     success: 5,
   };

   return (priority[a.type] || 99) - (priority[b.type] || 99);
 });
}
