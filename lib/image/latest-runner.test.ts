import { describe, expect, it, vi } from "vitest"

import { createLatestRunner } from "./latest-runner"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

describe("createLatestRunner", () => {
  it("skips requests superseded while another one runs", async () => {
    const first = deferred<string>()
    const run = vi.fn((input: number) =>
      input === 1 ? first.promise : Promise.resolve(`done ${input}`)
    )
    const onSettled = vi.fn()
    const runner = createLatestRunner(run, onSettled)

    runner.request(1)
    runner.request(2)
    runner.request(3)
    first.resolve("done 1")
    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1))

    expect(run.mock.calls.map(([input]) => input)).toEqual([1, 3])
    expect(onSettled).toHaveBeenCalledWith(3, { ok: true, value: "done 3" })
  })

  it("reports failures", async () => {
    const error = new Error("boom")
    const onSettled = vi.fn()
    const runner = createLatestRunner(() => Promise.reject(error), onSettled)

    runner.request("x")
    await vi.waitFor(() =>
      expect(onSettled).toHaveBeenCalledWith("x", { ok: false, error })
    )
  })

  it("reports nothing after dispose", async () => {
    const task = deferred<string>()
    const onSettled = vi.fn()
    const runner = createLatestRunner(() => task.promise, onSettled)

    runner.request("x")
    runner.dispose()
    task.resolve("late")
    await task.promise

    expect(onSettled).not.toHaveBeenCalled()
  })
})
