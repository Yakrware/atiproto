import { describe, it, expect, beforeEach, vi } from "vitest";

async function freshModule() {
  vi.resetModules();
  return import("../src/getKeyset.js");
}

describe("getKeyset", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("resolves to null when jwk is undefined", async () => {
    const { getKeyset } = await freshModule();
    await expect(getKeyset(undefined)).resolves.toBeNull();
  });

  it("resolves to null when jwk is an empty string", async () => {
    const { getKeyset } = await freshModule();
    await expect(getKeyset("")).resolves.toBeNull();
  });

  it("resolves to null when jwk is whitespace only", async () => {
    const { getKeyset } = await freshModule();
    await expect(getKeyset("   \n\t ")).resolves.toBeNull();
  });

  it("caches the resolved promise across calls", async () => {
    const { getKeyset } = await freshModule();
    const first = getKeyset(undefined);
    const second = getKeyset("ignored-after-cache");
    expect(first).toBe(second);
    await expect(second).resolves.toBeNull();
  });
});
