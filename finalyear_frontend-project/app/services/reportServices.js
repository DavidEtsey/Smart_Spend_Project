import { apiFetch } from "./api";

const REPORT_PERIODS = {
  thisMonth: "THIS_MONTH",
  lastMonth: "LAST_MONTH",
  thisYear: "THIS_YEAR",
  lastYear: "LAST_YEAR",
  all: "ALL_TRANSACTIONS",
};

export async function requestExcelReport({
  period,
}) {
  const backendPeriod = REPORT_PERIODS[period];

  if (!backendPeriod) {
    throw new Error("Invalid report period.");
  }

  return apiFetch("/settings/reports/export-excel", {
    method: "POST",
    body: { period: backendPeriod },
  });
}
