import { fetchAuthSession } from "aws-amplify/auth";

export async function apiFetch(url, options = {}) {
  const session = await fetchAuthSession({
    forceRefresh: false,
  });

  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error("No access token");
  }

  const isFormData = options.body instanceof FormData;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
}