import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function exportTransactionsToExcel(
  transactions,
  settings,
  period = "all",
) {
  try {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error("No transactions available for this report.");
    }

    const now = new Date();

    let reportName;

    switch (period) {
      case "thisMonth":
        reportName = now.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        break;

      case "lastMonth": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        reportName = lastMonth.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        break;
      }

      case "thisYear":
        reportName = String(now.getFullYear());
        break;

      case "lastYear":
        reportName = String(now.getFullYear() - 1);
        break;

      default:
        reportName = "All Transactions";
    }

    const currencyName = settings?.currency?.name || "Ghanaian Cedi";

    const currencySymbol = settings?.currency?.symbol || "GHS";

    const cleanTransactions = transactions.map((tx) => {
      let formattedDate = "";

      if (tx?.createdAt) {
        const date = new Date(tx.createdAt);

        if (!Number.isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString();
        }
      }

      return {
        date: formattedDate,

        category:
          tx?.category !== null && tx?.category !== undefined
            ? String(tx.category)
            : "",

        type:
          tx?.type !== null && tx?.type !== undefined ? String(tx.type) : "",

        account:
          tx?.account !== null && tx?.account !== undefined
            ? String(tx.account)
            : "",

        amount: Number(tx?.amount) || 0,

        description:
          tx?.description !== null && tx?.description !== undefined
            ? String(tx.description)
            : tx?.note !== null && tx?.note !== undefined
              ? String(tx.note)
              : "",
      };
    });

    const total = cleanTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    const rows = [
      ["Smart Spend"],
      ["Transaction Report"],
      [],

      ["Report Period", reportName],

      ["Generated On", now.toLocaleDateString()],

      ["Currency", `${currencyName} (${currencySymbol})`],

      [],

      ["Date", "Category", "Type", "Account", "Amount", "Description"],
    ];

    cleanTransactions.forEach((transaction) => {
      rows.push([
        transaction.date,
        transaction.category,
        transaction.type,
        transaction.account,
        transaction.amount,
        transaction.description,
      ]);
    });

    rows.push([]);

    rows.push(["TOTAL", "", "", "", total, ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelData = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const safeReportName = reportName
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const fileName = `SmartSpend-Excel-${safeReportName}.xlsx`;

    // WEB
    if (Platform.OS === "web") {
      const blob = new Blob([excelData], {
        type: EXCEL_MIME_TYPE,
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      return;
    }

    // ANDROID / IOS
    const bytes = new Uint8Array(excelData);

    let binary = "";

    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));

      binary += String.fromCharCode(...chunk);
    }

    const base64Data = btoa(binary);

    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: EXCEL_MIME_TYPE,

        dialogTitle: "Export Smart Spend Report",
      });
    } else {
      console.warn("Sharing is not available on this device.");
    }

    return fileUri;
  } catch (error) {
    console.error("Excel Export Error:", error);

    throw error;
  }
}
