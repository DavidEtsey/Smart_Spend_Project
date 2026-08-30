import { Modal, View, Pressable, StyleSheet } from "react-native";
import { Text, HStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Calculator({
  value = "0",
  currency = "USD",
  onChange,
  onClose,
  onCurrencyChange,
}) {
  const CURRENCIES = ["USD", "EUR", "GBP", "GHS", "NGN", "KES"];
  const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    GHS: "₵",
    NGN: "₦",
    KES: "KSh",
  };

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [display, setDisplay] = useState(value);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Load last used currency and exchange rates on mount
  useEffect(() => {
    loadLastCurrency();
    fetchExchangeRates();
  }, []);

  // Save currency whenever it changes
  useEffect(() => {
    if (currency) {
      saveLastCurrency(currency);
    }
  }, [currency]);

  // Load last used currency from storage
  const loadLastCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem("lastCurrency");
      if (
        savedCurrency &&
        CURRENCIES.includes(savedCurrency) &&
        onCurrencyChange
      ) {
        onCurrencyChange(savedCurrency);
      }
    } catch (error) {
      console.error("Error loading last currency:", error);
    }
  };

  // Save currency to storage
  const saveLastCurrency = async (currency) => {
    try {
      await AsyncStorage.setItem("lastCurrency", currency);
    } catch (error) {
      console.error("Error saving last currency:", error);
    }
  };

  // Fetch exchange rates from API (using a free API)
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      // You might want to use a real API key for production
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`,
      );
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Fallback to approximate rates if API fails
      setExchangeRates({
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        GHS: 12.5,
        NGN: 1500,
        KES: 160,
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Format number with currency symbol
  const formatWithCurrency = (amount, currencyCode) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const amountNum = parseFloat(amount) || 0;

    // Format with appropriate decimal places based on currency
    const decimalPlaces = currencyCode === "JPY" ? 0 : 2;
    const formattedAmount = amountNum.toFixed(decimalPlaces);

    // Position symbol based on currency convention
    if (
      currencyCode === "USD" ||
      currencyCode === "GBP" ||
      currencyCode === "GHS"
    ) {
      return `${symbol}${formattedAmount}`;
    } else if (currencyCode === "EUR") {
      return `${formattedAmount} ${symbol}`;
    } else {
      return `${symbol} ${formattedAmount}`;
    }
  };

  // Calculate exchange rate preview
  const getExchangePreview = () => {
    if (!exchangeRates || currency === "USD") return null;

    const currentAmount = parseFloat(display) || 0;
    const rate = exchangeRates[currency];
    if (!rate) return null;

    const usdAmount = currentAmount / rate;
    return `${formatWithCurrency(usdAmount.toFixed(2), "USD")}`;
  };

  const isOperator = (k) => ["+", "-", "×", "÷"].includes(k);

  const sanitize = (expr) => expr.replace(/×/g, "*").replace(/÷/g, "/");

  const evaluate = () => {
    try {
      const result = new Function(`return ${sanitize(display)}`)();
      return parseFloat(result.toFixed(2)).toString();
    } catch {
      return display;
    }
  };

  const append = (val) => {
    const last = display.slice(-1);

    if (isOperator(val) && isOperator(last)) return;
    if (display === "0" && isOperator(val) && val !== "-") return;

    const next = display === "0" ? val : display + val;
    setDisplay(next);
    onChange(next);
  };

  const backspace = () => {
    const next = display.slice(0, -1) || "0";
    setDisplay(next);
    onChange(next);
  };

  const clear = () => {
    setDisplay("0");
    onChange("0");
  };

  const onEquals = () => {
    const result = evaluate();
    setDisplay(result);
    onChange(result);
  };

  const onDone = () => {
    onEquals();
    onClose();
  };

  return (
    <Modal transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* HEADER - Reduced size */}
          <HStack
            bg="$green600"
            px="$3"
            py="$1.5"
            style={styles.header}
            justifyContent="space-between"
            alignItems="center"
          >
            <Pressable
              style={styles.currencyButton}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <Text ml="$1" fontWeight="$medium" fontSize="$sm">
                {" "}
                {/* Added fontSize="$sm" */}
                {currency} ({CURRENCY_SYMBOLS[currency] || currency})
              </Text>
              <Feather name="chevron-down" size={14} color="#666" />{" "}
            </Pressable>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="#fff" mr="$3" />{" "}
            </Pressable>
          </HStack>

          {/* DISPLAY */}
          <View style={styles.display}>
            <Text style={styles.amount} numberOfLines={1}>
              {formatWithCurrency(display, currency)}
            </Text>

            {/* Exchange Rate Preview */}
            {getExchangePreview() && (
              <Text style={styles.exchangePreview}>
                ≈ {getExchangePreview()}
                {isLoadingRates && (
                  <Text style={styles.loadingText}> (updating...)</Text>
                )}
              </Text>
            )}

            {!getExchangePreview() && isLoadingRates && (
              <Text style={styles.exchangePreview}>
                Loading exchange rates...
              </Text>
            )}
          </View>

          {/* KEYPAD */}
          <View style={styles.pad}>
            {/* OPERATORS TOP */}
            <View style={styles.row}>
              {["+", "-", "×"].map((k) => (
                <Key key={k} label={k} operator onPress={() => append(k)} />
              ))}
            </View>

            {/* MAIN GRID */}
            {[
              ["7", "8", "9", "÷"],
              ["4", "5", "6", "="],
              ["1", "2", "3", "⌫"],
            ].map((row, i) => (
              <View key={i} style={styles.row}>
                {row.map((k) =>
                  k === "=" ? (
                    <Key key={k} label="=" operator onPress={onEquals} />
                  ) : k === "⌫" ? (
                    <Key key={k} label="⌫" onPress={backspace} />
                  ) : (
                    <Key
                      key={k}
                      label={k}
                      operator={isOperator(k)}
                      onPress={() => append(k)}
                    />
                  ),
                )}
              </View>
            ))}

            {/* BOTTOM ROW */}
            <View style={styles.row}>
              <Key label="C" operator onPress={clear} />
              <Key label="0" wide onPress={() => append("0")} />
              <Key label="OK" confirm onPress={onDone} />
            </View>
          </View>
        </View>
      </View>

      {/* CURRENCY PICKER MODAL */}
      {showCurrencyPicker && (
        <Modal transparent animationType="fade">
          <Pressable
            style={styles.currencyOverlay}
            onPress={() => setShowCurrencyPicker(false)}
          >
            <View style={styles.currencySheet}>
              <Text style={styles.currencySheetTitle}>Select Currency</Text>
              {CURRENCIES.map((cur) => {
                const symbol = CURRENCY_SYMBOLS[cur] || cur;
                const rate = exchangeRates ? exchangeRates[cur] : null;

                return (
                  <Pressable
                    key={cur}
                    style={styles.currencyItem}
                    onPress={() => {
                      onCurrencyChange?.(cur);
                      setShowCurrencyPicker(false);
                    }}
                  >
                    <View style={styles.currencyInfo}>
                      <Text style={styles.currencyCode}>
                        {cur} ({symbol})
                      </Text>
                      {rate && (
                        <Text style={styles.currencyRate}>
                          1 USD = {rate.toFixed(2)} {cur}
                        </Text>
                      )}
                    </View>
                    {cur === currency && (
                      <Feather name="check" size={18} color="#22c55e" />
                    )}
                  </Pressable>
                );
              })}

              {/* Refresh rates button */}
              <Pressable
                style={styles.refreshButton}
                onPress={fetchExchangeRates}
                disabled={isLoadingRates}
              >
                <Feather
                  name="refresh-cw"
                  size={16}
                  color={isLoadingRates ? "#999" : "#007AFF"}
                />
                <Text
                  style={[
                    styles.refreshText,
                    isLoadingRates && styles.refreshTextDisabled,
                  ]}
                >
                  {isLoadingRates ? "Updating..." : "Refresh Rates"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

/* ---------- KEY COMPONENT ---------- */
function Key({ label, onPress, operator, confirm, wide }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        operator && styles.operatorKey,
        confirm && styles.confirmKey,
        wide && { flex: 2 },
        pressed && styles.keyPressed,
      ]}
    >
      <Text
        style={[
          styles.keyText,
          operator && styles.operatorText,
          confirm && styles.confirmText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
    maxHeight: "90%",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  display: {
    padding: 24,
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderColor: "#eee",
    minHeight: 120,
  },
  amount: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "right",
  },
  currency: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  exchangePreview: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  loadingText: {
    color: "#999",
    fontSize: 12,
  },
  pad: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  key: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
  },
  keyPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  keyText: {
    fontSize: 22,
    fontWeight: "500",
  },
  operatorKey: {
    backgroundColor: "#fef2f2",
  },
  operatorText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  confirmKey: {
    backgroundColor: "#22c55e",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
    gap: 4,
  },
  closeButton: {
    padding: 4,
  },
  currencyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  currencySheet: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 16,
    paddingVertical: 8,
    maxHeight: "80%",
  },
  currencySheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "500",
  },
  currencyRate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  refreshText: {
    color: "#007AFF",
    fontSize: 14,
  },
  refreshTextDisabled: {
    color: "#999",
  },
});
