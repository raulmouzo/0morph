export type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown }

/**
 * Runs an async task one request at a time. While a request is in flight,
 * newer requests replace each other so only the most recent one runs next,
 * and only the result of the latest request is reported.
 */
export function createLatestRunner<I, O>(
  run: (input: I) => Promise<O>,
  onSettled: (input: I, result: Settled<O>) => void
) {
  let pending: { input: I } | null = null
  let running = false
  let disposed = false

  async function drain() {
    running = true
    while (pending && !disposed) {
      const { input } = pending
      pending = null
      let result: Settled<O>
      try {
        result = { ok: true, value: await run(input) }
      } catch (error) {
        result = { ok: false, error }
      }
      if (!pending && !disposed) onSettled(input, result)
    }
    running = false
  }

  return {
    request(input: I) {
      pending = { input }
      if (!running) void drain()
    },
    dispose() {
      disposed = true
      pending = null
    },
  }
}
