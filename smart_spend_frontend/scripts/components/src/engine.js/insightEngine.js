// src/engine/insightEngine.js
import {
  calculateCategoryStats,
  calculateSpendingStats,
} from "./utils/analytics";

import { dominantCategoryRule, dailyAverageRule } from "../rule/index";
import { anomalyRule, dailySpikeRule, frequentSmallSpendsRule } from "./alert/index";

export function generateInsights(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const categories = calculateCategoryStats(transactions);
  const stats = calculateSpendingStats(transactions);

  const insights = [];

  const dominant = dominantCategoryRule(categories);
  if (dominant) insights.push(dominant);

  const daily = dailyAverageRule(stats.dailyAverage);
  if (daily) insights.push(daily);

  insights.push(...anomalyRule(transactions, categories));

  return insights;
}
