import { ScrollView, Alert } from "react-native";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useAppTheme from "../../../hooks/useAppTheme";

import { useSettings } from "../../contexts/settingsContext";
import { useTransactions } from "../../contexts/transactionsContext";
import { useBudgets } from "../../contexts/budgetContext";

import { exportBackup } from "../../services/backupServices";
import { restoreBackup } from "../../services/restoreServices";
import { exportTransactionsToExcel } from "../../services/exportExcel";
import { filterTransactions } from "../../services/filterTransactions";

import ExportTransactionsModal from "../../../components/exportReportmodal";

export default function BackupScreen() {
  const { colors } = useAppTheme();

  const { settings, restoreSettings, updateLastBackupDate, resetSettings } =
    useSettings();

  const { transactions, restoreTransactions, resetTransactions } =
    useTransactions();

  const { budgets, restoreBudgets, resetBudgets } = useBudgets();

  const [exportModalVisible, setExportModalVisible] = useState(false);

  // --------------------------------------------------
  // BACKUP
  // --------------------------------------------------

  const handleBackup = async () => {
    try {
      const success = await exportBackup({
        settings,
        transactions,
        budgets,
      });

      if (success) {
        updateLastBackupDate(new Date().toISOString());

        Alert.alert(
          "Backup Complete",
          "Your app data has been backed up successfully.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Backup Failed",
        error?.message || "Unable to create backup.",
      );
    }
  };

  // --------------------------------------------------
  // RESTORE
  // --------------------------------------------------

  const handleRestore = async () => {
    try {
      const backup = await restoreBackup();

      // User cancelled file picker
      if (!backup) {
        return;
      }

      const {
        metadata = {},
        transactions: backupTransactions = [],
        budgets: backupBudgets = [],
        settings: backupSettings = {},
      } = backup;

      const backupDate = metadata.createdAt
        ? new Date(metadata.createdAt).toLocaleString()
        : "Unknown";

      Alert.alert(
        "Restore Backup",
        `Backup Date: ${backupDate}

Transactions: ${backupTransactions.length}
Budgets: ${backupBudgets.length}
Currency: ${backupSettings.currency?.code ?? "Unknown"}

This will replace your current data.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Restore",
            style: "destructive",
            onPress: () => {
              restoreTransactions(backupTransactions);
              restoreBudgets(backupBudgets);
              restoreSettings(backupSettings);

              Alert.alert(
                "Restore Complete",
                "Your backup has been restored successfully.",
              );
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Restore Failed",
        error?.message || "Unable to restore backup.",
      );
    }
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all transactions, budgets and settings.\n\nThis action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            resetTransactions();
            resetBudgets();
            resetSettings();

            await AsyncStorage.removeItem("lastBackupDate");

            Alert.alert("Reset Complete", "All app data has been removed.");
          },
        },
      ],
    );
  };

  // --------------------------------------------------
  // EXPORT TRANSACTIONS TO EXCEL
  // --------------------------------------------------

  const handleExportTransactions = async (period) => {
    try {
      const filtered = filterTransactions(transactions, period);

      await exportTransactionsToExcel(filtered, settings, period);

      setExportModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Export Failed",
        error?.message || "Unable to export transactions.",
      );
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Box
      flex={1}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      {/* Header */}
      <HStack
        px="$5"
        pt="$12"
        pb="$4"
        alignItems="center"
        borderBottomWidth={1}
        borderColor={colors.border}
        bg={colors.header}
      >
        <Pressable onPress={() => router.back()}>
          <HStack alignItems="center">
            <Feather name="chevron-left" size={24} color={colors.text} />

            <Text
              ml="$0.5"
              fontSize="$md"
              fontWeight="$500"
              color={colors.text}
            >
              Settings
            </Text>
          </HStack>
        </Pressable>

        <Text
          flex={1}
          textAlign="center"
          fontSize="$lg"
          fontWeight="$bold"
          color={colors.text}
        >
          Backup & Restore
        </Text>
      </HStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        <VStack space="lg" p="$5">
          {/* Last Backup */}
          <Box bg={colors.card} p="$4" borderRadius="$xl">
            <Text fontWeight="$bold" color={colors.text} mb="$1">
              Last Backup
            </Text>

            <Text color={colors.subText}>
              {settings.lastBackupDate
                ? new Date(settings.lastBackupDate).toLocaleString()
                : "No backup has been created yet."}
            </Text>
          </Box>

          {/* Export Backup */}
          <Pressable onPress={handleBackup}>
            <Box bg={colors.card} p="$5" borderRadius="$xl">
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Feather name="download" size={22} color={colors.primary} />

                  <Box>
                    <Text fontWeight="$bold" color={colors.text}>
                      Export Backup
                    </Text>

                    <Text color={colors.subText}>
                      Save all app data as a backup
                    </Text>
                  </Box>
                </HStack>

                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.subText}
                />
              </HStack>
            </Box>
          </Pressable>

          {/* Restore Backup */}
          <Pressable onPress={handleRestore}>
            <Box bg={colors.card} p="$5" borderRadius="$xl">
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Feather name="upload" size={22} color={colors.primary} />

                  <Box>
                    <Text fontWeight="$bold" color={colors.text}>
                      Restore Backup
                    </Text>

                    <Text color={colors.subText}>
                      Restore data from a backup file
                    </Text>
                  </Box>
                </HStack>

                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.subText}
                />
              </HStack>
            </Box>
          </Pressable>

          {/* Export Transactions */}
          <Pressable onPress={() => setExportModalVisible(true)}>
            <Box bg={colors.card} p="$5" borderRadius="$xl">
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Feather name="file-text" size={22} color={colors.primary} />

                  <Box>
                    <Text fontWeight="$bold" color={colors.text}>
                      Export Transactions
                    </Text>

                    <Text color={colors.subText}>
                      Export transaction history to Excel
                    </Text>
                  </Box>
                </HStack>

                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.subText}
                />
              </HStack>
            </Box>
          </Pressable>

          {/* Reset All Data */}
          <Pressable onPress={handleReset}>
            <Box bg={colors.card} p="$5" borderRadius="$xl">
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Feather name="trash-2" size={22} color="#EF4444" />

                  <Box>
                    <Text fontWeight="$bold" color={colors.text}>
                      Reset All Data
                    </Text>

                    <Text color={colors.subText}>
                      Permanently erase all app data
                    </Text>
                  </Box>
                </HStack>
              </HStack>
            </Box>
          </Pressable>
        </VStack>
      </ScrollView>

      {/* Export Transactions Modal */}
      <ExportTransactionsModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onSelect={handleExportTransactions}
      />
    </Box>
  );
}
