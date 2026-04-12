// 🔥 RATE LIMIT + RETRY HELPERS

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(fn, retries = 3) {
  try {
    return await fn();
  } catch (err) {
    const status = err.response?.status;

    // Only retry for rate limit / timeout
    if (![429, 504].includes(status) || retries === 0) {
      throw err;
    }

    const delay = (4 - retries) * 2000; // exponential backoff
    console.log(`⏳ Retry in ${delay}ms (status: ${status})`);

    await sleep(delay);
    return fetchWithRetry(fn, retries - 1);
  }
}