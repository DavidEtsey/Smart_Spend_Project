import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const CURRENT_BACKUP_VERSION = "1.0.0";

export async function restoreBackup() {
  try {
    // Open the file picker
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    // User cancelled
    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];

    // Read the backup file
    const content = await FileSystem.readAsStringAsync(file.uri);

    const backup = JSON.parse(content);

    // Validate backup structure
    if (
      !backup ||
      typeof backup !== "object" ||
      !("settings" in backup) ||
      !("transactions" in backup) ||
      !("budgets" in backup)
    ) {
      throw new Error("Invalid backup file.");
    }

    // Validate metadata
    if (!backup.metadata) {
      throw new Error("Backup metadata is missing.");
    }

    // Ensure this is a Smart Spend backup
    if (backup.metadata.app !== "Smart Spend") {
      throw new Error("This is not a Smart Spend backup.");
    }

    // Version check
    if (backup.metadata.version !== CURRENT_BACKUP_VERSION) {
      console.warn(
        `Backup version ${backup.metadata.version} differs from app version ${CURRENT_BACKUP_VERSION}.`,
      );

    }

    return backup;
  } catch (error) {
    console.log("Restore Error:", error);
    throw error;
  }
}
