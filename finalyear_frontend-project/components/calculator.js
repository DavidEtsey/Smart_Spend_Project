import { Modal, View, Pressable, StyleSheet } from "react-native";
import { Text, HStack } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import useAppTheme from "../hooks/useAppTheme";
import { useSettings } from "../app/contexts/settingsContext";

export default function Calculator({ value = "0", onChange, onClose }) {
  const [display, setDisplay] = useState(value);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const { colors } = useAppTheme();
  const { settings } = useSettings();
  const currentCurrency = settings.currency;
  const currencyCode = currentCurrency.code;
  const currencySymbol = currentCurrency.symbol;
  

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
    
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`,
      );
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
     
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

 
 const formatWithCurrency = (amount, currency) => {
   const amountNum = Number(amount) || 0;

   return new Intl.NumberFormat(undefined, {
     style: "currency",
     currency: currency,
   }).format(amountNum);
 };

  // Calculate exchange rate preview
  const getExchangePreview = () => {
    if (!exchangeRates || currencyCode === "USD") return null;
    const rate = exchangeRates[currencyCode];

    const currentAmount = parseFloat(display) || 0;
    if (!rate) return null;

    const usdAmount = currentAmount / rate;
    return `${formatWithCurrency(usdAmount.toFixed(2), "USD")}`;
  };

  const isOperator = (k) => ["+", "-", "×", "÷"].includes(k);

  const sanitize = (expr) => expr.replace(/×/g, "*").replace(/÷/g, "/");

  const evaluate = () => {
    try {
      const result = new Function(`return ${sanitize(display)}`)();
      return parseFloat(result.toFixed(2));
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
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.overlay,
          },
        ]}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <HStack
            px="$3"
            py="$1.5"
            justifyContent="space-between"
            alignItems="center"
            style={[
              styles.header,
              {
                backgroundColor: colors.primary,
                borderBottomColor: colors.border,
              },
              {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            ]}
          >
            <View
              style={[
                styles.currencyButton,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text
                ml="$1"
                fontWeight="$medium"
                fontSize="$sm"
                color={colors.text}
              >
                {currencyCode} ({currencySymbol})
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather
                name="x"
                size={20}
                color={colors.onPrimary}
                style={{ marginRight: 12 }}
              />
            </Pressable>
          </HStack>

          {/* DISPLAY */}
          <View
            style={[
              styles.display,
              {
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={styles.amount}>
              {currencySymbol}
              {display}
            </Text>

            {/* Exchange Rate Preview */}
            {getExchangePreview() && (
              <Text
                style={[
                  styles.exchangePreview,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                ≈ {getExchangePreview()}
                {isLoadingRates && (
                  <Text
                    style={[
                      styles.loadingText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {" "}
                    (updating...)
                  </Text>
                )}
              </Text>
            )}

            {!getExchangePreview() && isLoadingRates && (
              <Text
                style={[
                  styles.exchangePreview,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Loading exchange rates...
              </Text>
            )}
          </View>

          {/* KEYPAD */}
          <View style={styles.pad}>
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
                    <Key key="⌫" label="⌫" deleteKey onPress={backspace} />
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
    </Modal>
  );
}

/* ---------- KEY COMPONENT ---------- */
function Key({ label, onPress, operator, confirm, deleteKey, wide }) {
  const { colors } = useAppTheme();

  let backgroundColor = colors.surface;
  let textColor = colors.text;

  // + - × ÷ = C
  if (operator) {
    backgroundColor = "#FEF2F2";
    textColor = "#EF4444";
  }

  // Delete
  if (deleteKey) {
    backgroundColor = colors.surface;
    textColor = colors.text;
  }

  // OK
  if (confirm) {
    backgroundColor = colors.primary;
    textColor = colors.onPrimary;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        {
          backgroundColor,
          borderColor: colors.border,
          borderWidth: 1,
        },
        wide && { flex: 2 },
        pressed && styles.keyPressed,
      ]}
    >
      <Text
        style={[
          styles.keyText,
          {
            color: textColor,
          },
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
    justifyContent: "flex-end",
  },
  sheet: {
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
  },
  keyPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  keyText: {
    fontSize: 22,
    fontWeight: "500",
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

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
});
