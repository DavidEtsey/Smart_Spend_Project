export function generateNotification({
  monthlyIncome = 0,
  monthlyExpense = 0,
  budgetSummary = [],
  transactions = [],
  insights = [],
}) {
  //
  // 1. New user
  //
  if (transactions.length === 0) {
    return {
      title: "👋 Welcome!",
      body: "Record your first expense today and begin building smarter financial habits.",
    };
  }

  //
  // 2. Check for important insights first
  //
  const criticalInsight = insights.find(
    (i) => i.type === "warning" || i.type === "alert",
  );

  if (criticalInsight) {
    return {
      title: criticalInsight.title,
      body: criticalInsight.message,
    };
  }

  //
  // 3. Budget exceeded
  //
  const overBudget = budgetSummary.find((b) => b.percentage >= 100);

  if (overBudget) {
    return {
      title: "🚨 Budget Exceeded",
      body: `You've exceeded your ${overBudget.category} budget. Try reducing spending in this category.`,
    };
  }

  //
  // 4. Budget almost exceeded
  //
  const nearLimit = budgetSummary.find((b) => b.percentage >= 90);

  if (nearLimit) {
    return {
      title: "⚠ Budget Warning",
      body: `${nearLimit.category} has reached ${Math.round(
        nearLimit.percentage,
      )}% of its budget.`,
    };
  }

  //
  // 5. Spending too much overall
  //
  if (monthlyIncome > 0 && monthlyExpense >= monthlyIncome * 0.8) {
    return {
      title: "💳 Spending Alert",
      body: "You've already spent over 80% of this month's income.",
    };
  }

  //
  // 6. Healthy spending
  //
  if (monthlyIncome > 0 && monthlyExpense < monthlyIncome * 0.6) {
    return {
      title: "🎉 Great Job!",
      body: "You're managing your spending well this month. Keep it up!",
    };
  }

  //
  // 7. Rotate daily reminders
  //
  const reminders = [
    {
      title: "💰 Expense Reminder",
      body: "Don't forget to record today's spending.",
    },
    {
      title: "📊 Keep Your Budget Accurate",
      body: "Adding today's expenses helps your insights stay accurate.",
    },
    {
      title: "📈 Build Better Habits",
      body: "Recording expenses every day leads to better financial decisions.",
    },
    {
      title: "🛒 Bought Something Today?",
      body: "Take a moment to log today's purchases before you forget.",
    },
    {
      title: "🚀 Stay Consistent",
      body: "Small daily habits create long-term financial success.",
    },
    {
      title: "🌙 Before You Sleep",
      body: "Review and record today's expenses in just a minute.",
    },
    {
      title: "💡 Smart Finance Tip",
      body: "Tracking expenses regularly helps you identify saving opportunities.",
    },
  ];

  return reminders[Math.floor(Math.random() * reminders.length)];
}
