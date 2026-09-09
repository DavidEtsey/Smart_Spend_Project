// Colors used for automatically generated accounts
export const ACCOUNT_COLORS = [
  "#85BB65",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
];

// Account icon keys
export const ACCOUNT_ICON_MAP = {
  cash: "💵",
  bank: "🏦",
  mobile_money: "📱",
  savings: "🐖",
  wallet: "👛",
  card: "💳",
  investment: "📈",
  business: "💼",
  piggy_bank: "🐷",
  coins: "🪙",
  credit_card: "💳",
  other: "💰",
};

// Human-readable names
export const ACCOUNT_ICON_LABELS = {
  cash: "Cash",
  bank: "Bank",
  mobile_money: "Mobile Money",
  savings: "Savings",
  wallet: "Wallet",
  card: "Card",
  investment: "Investment",
  business: "Business",
  piggy_bank: "Piggy Bank",
  coins: "Coins",
  credit_card: "Credit Card",
  other: "Other",
};

/**
 * Automatically determines an account icon
 * based on the account name.
 */
export const getAccountIcon = (name = "") => {
  const text = name.toLowerCase().trim();

  if (!text) {
    return "cash";
  }

  // Mobile money
  if (
    text.includes("momo") ||
    text.includes("mobile money") ||
    text.includes("mobile")
  ) {
    return "mobile_money";
  }

  // Banks
  if (
    text.includes("bank") ||
    text.includes("ecobank") ||
    text.includes("stanbic") ||
    text.includes("calbank") ||
    text.includes("fidelity") ||
    text.includes("absa") ||
    text.includes("gcb") ||
    text.includes("republic") ||
    text.includes("access")
  ) {
    return "bank";
  }

  // Savings
  if (
    text.includes("saving") ||
    text.includes("savings") ||
    text.includes("emergency fund")
  ) {
    return "savings";
  }

  // Investment
  if (
    text.includes("invest") ||
    text.includes("investment") ||
    text.includes("stocks") ||
    text.includes("shares")
  ) {
    return "investment";
  }

  // Business
  if (
    text.includes("business") ||
    text.includes("company") ||
    text.includes("work")
  ) {
    return "business";
  }

  // Wallet
  if (text.includes("wallet") || text.includes("purse")) {
    return "wallet";
  }

  // Credit card
  if (text.includes("credit")) {
    return "credit_card";
  }

  // Debit / normal card
  if (
    text.includes("card") ||
    text.includes("visa") ||
    text.includes("mastercard")
  ) {
    return "card";
  }

  // Piggy bank
  if (text.includes("piggy") || text.includes("fund")) {
    return "piggy_bank";
  }

  // Coins
  if (text.includes("coin") || text.includes("change")) {
    return "coins";
  }

  // Cash
  if (text.includes("cash") || text.includes("money")) {
    return "cash";
  }

  // Default
  return "other";
};

/**
 * Generates a consistent color from the account name.
 *
 * The same account name will always produce
 * the same color.
 */
export const getAccountColor = (name = "") => {
  const text = name.trim();

  if (!text) {
    return ACCOUNT_COLORS[0];
  }

  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % ACCOUNT_COLORS.length;

  return ACCOUNT_COLORS[index];
};

/**
 * Generates the complete account appearance.
 */
export const getAccountAppearance = (name = "") => {
  return {
    icon: getAccountIcon(name),
    color: getAccountColor(name),
  };
};
