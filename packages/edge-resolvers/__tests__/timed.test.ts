import { describe, it, expect, vi } from "vitest";
import { timed } from "../src/timed.js";

describe("timed", () => {
  it("returns the result of the function", async () => {
    const result = await timed(1000, async () => "hello");
    expect(result).toBe("hello");
  });

  it("passes an AbortSignal to the function", async () => {
    let receivedSignal: AbortSignal | undefined;
    await timed(1000, async (signal) => {
      receivedSignal = signal;
    });
    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });

  it("aborts the signal after timeout", async () => {
    vi.useFakeTimers();
    const fn = vi.fn(async (signal: AbortSignal) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")));
      });
    });

    const promise = timed(500, fn);
    vi.advanceTimersByTime(500);

    await expect(promise).rejects.toThrow("aborted");
    vi.useRealTimers();
  });

  it("cleans up the timer on success", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    await timed(5000, async () => "done");
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("cleans up the timer on error", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    await expect(
      timed(5000, async () => {
        throw new Error("fail");
      }),
    ).rejects.toThrow("fail");
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
