import { fetchAuthSession } from "aws-amplify/auth";

export async function apiFetch(url, options = {}) {
  const session = await fetchAuthSession();

  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error("No access token");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}