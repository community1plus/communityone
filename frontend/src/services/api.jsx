export async function apiFetch(url, options = {}) {
  const { token, body, headers, ...fetchOptions } = options;

  if (!token) {
    throw new Error("No access token");
  }

  const isFormData = body instanceof FormData;
  const hasBody = body !== null && body !== undefined;

  return fetch(url, {
    ...fetchOptions,
    body: hasBody
      ? isFormData || typeof body === "string"
        ? body
        : JSON.stringify(body)
      : undefined,
    headers: {
      ...(headers || {}),
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
}