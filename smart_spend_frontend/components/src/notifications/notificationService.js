import { generateNotification } from "./notificationEgine";

export function getDailyNotification({
  monthlyIncome,
  monthlyExpense,
  budgetSummary,
  transactions,
  insights,
}) {
  return generateNotification({
    monthlyIncome,
    monthlyExpense,
    budgetSummary,
    transactions,
    insights,
  });
}
