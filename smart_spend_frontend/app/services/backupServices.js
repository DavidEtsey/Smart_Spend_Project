import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";

export async function exportBackup(data) {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace("T", "_")
      .split(".")[0];

    const fileName = `SmartSpend_Backup_${timestamp}.json`;

    const fileUri = FileSystem.documentDirectory + fileName;

    // Create backup object
    const backup = {
      metadata: {
        app: "Smart Spend",
        version:
          Constants.expoConfig?.version ||
          Constants.manifest?.version ||
          "1.0.0",
        createdAt: new Date().toISOString(),
        device: Platform.OS,
      },

      settings: data.settings,
      transactions: data.transactions,
      budgets: data.budgets,
    };

    // Save backup file
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(backup, null, 2),
    );

    // Web isn't supported
    if (Platform.OS === "web") {
      alert("Backup export is currently available only on Android and iOS.");
      return false;
    }

    // Share the backup file
    const available = await Sharing.isAvailableAsync();

    if (available) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Export Smart Spend Backup",
      });

      Alert.alert(
        "Backup Created",
        "Your backup has been created successfully.",
      );

      // Save the date of the last successful backup
      await AsyncStorage.setItem("lastBackupDate", new Date().toISOString());

      return true;
    } else {
      alert("Sharing is not available on this device.");
      return false;
    }
  } catch (error) {
    console.log("Backup Error:", error);
    alert("Failed to export backup.");
    return false;
  }
}
