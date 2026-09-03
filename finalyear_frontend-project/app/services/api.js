import * as SecureStore from "expo-secure-store";

const DEFAULT_HOST = "http://172.20.10.3:5002";

const ROOT = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST).replace(
  /\/+$/,
  "",
);

export const API_URL = `${ROOT}/api`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getAuthToken() {
  try {
    return await SecureStore.getItemAsync("accessToken");
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = await getAuthToken();

  if (!token) {
    throw new ApiError("You are not signed in.", 401);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${API_URL}. Check that it is running and that EXPO_PUBLIC_API_URL is right for this device.`,
      0,
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      response.status,
    );
  }

  return payload;
}

export async function fetchAccounts() {
  const payload = await apiFetch("/accounts/view");
  return payload?.data || [];
}

export async function createAccount({ name, icon, color }) {
  const payload = await apiFetch("/accounts/customize", {
    method: "POST",
    body: { name, icon, color },
  });
  return payload?.data || null;
}

export async function fetchCategories(type) {
  const payload = await apiFetch(
    `/categories/view?type=${encodeURIComponent(type)}`,
  );
  return payload?.data || [];
}

export async function createBudget(category_id, amount_limit) {
  console.log("createBudget received:", 
    { category_id, 
      amount_limit, 
      category_id_type: typeof category_id, 
      amount_limit_type: typeof amount_limit, 
    });

  if (
    category_id === undefined ||
    category_id === null ||
    amount_limit === undefined ||
    amount_limit === null ||
    amount_limit === ""
  ) {
    throw new ApiError("Category ID and Amount are required", 400);
  }

  const categoryId = Number(category_id);
  const amount = Number(amount_limit);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new ApiError("Invalid category ID.", 400);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(
      "Budget amount must be greater than zero.",
      400
    );
  }

  const payload = await apiFetch("/budgets/create", {
    method: "POST",
    body: {
      category_id: categoryId,
      amount_limit: amount,
    },
  });

  return payload?.data || null;
}

export const fetchAnalytics = async () => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/analytics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to fetch analytics"
      );
    }

    return result;
  } catch (error) {
    console.error("Fetch analytics error:", error);
    throw error;
  }
};