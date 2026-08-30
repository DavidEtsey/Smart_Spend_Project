import axios from "axios";

export async function requestExcelReport({
  startDate,
  endDate,
  period,
  recipientEmail,
}) {
  try {
    const response = await axios.post("YOUR_BACKEND_URL/reports/export-excel", {
      startDate,
      endDate,
      period,
      recipientEmail,
    });

    return response.data;
  } catch (error) {
    console.log("Export Report Error:", error.response?.data || error.message);

    throw error;
  }
}
