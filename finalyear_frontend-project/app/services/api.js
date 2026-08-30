import * as SecureStore from "expo-secure-store";

/*
 * Single source of truth for the API base URL.
 */
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

export const createBudget = async (category_id, amount_limit) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/budgets/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category_id: Number(category_id),
        amount_limit: Number(amount_limit),
      }),
    },
  );

  const result = await response.json();

  console.log("Create budget status:", response.status);
  console.log("Create budget response:", data);

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Failed to create budget.",
    );
  }

  return result;
};
