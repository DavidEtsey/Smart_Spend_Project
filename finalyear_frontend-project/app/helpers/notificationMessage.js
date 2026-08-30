export function generateNotification({
  budgetAssistant,
  monthlyExpense,
  monthlyIncome,
}) {
  if (budgetAssistant?.type === "danger") {
    return {
      title: "🚨 Budget Alert",
      body: budgetAssistant.message,
    };
  }

  if (budgetAssistant?.type === "warning") {
    return {
      title: "⚠️ Budget Warning",
      body: budgetAssistant.message,
    };
  }

  if (monthlyExpense === 0) {
    return {
      title: "👋 Welcome",
      body: "Record your first expense today to start building insights.",
    };
  }

  if (monthlyIncome > monthlyExpense) {
    return {
      title: "🎉 You're Doing Great",
      body: "You're spending less than you earn. Keep it up!",
    };
  }

  return {
    title: "💰 Expense Reminder",
    body: "Don't forget to record today's transactions.",
  };
}
