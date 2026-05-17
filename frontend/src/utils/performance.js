// performance.js

export function trackPerf(
  label,
  start
) {
  const duration =
    performance.now() - start;

  console.log(
    `${label}: ${duration.toFixed(2)}ms`
  );
}