/**
 * Run a function with an abort signal that fires after the given timeout.
 */
export async function timed<F extends (signal: AbortSignal) => unknown>(
  ms: number,
  fn: F,
): Promise<Awaited<ReturnType<F>>> {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), ms);

  try {
    return (await fn(abortController.signal)) as Awaited<ReturnType<F>>;
  } finally {
    clearTimeout(timer);
    abortController.abort();
  }
}
