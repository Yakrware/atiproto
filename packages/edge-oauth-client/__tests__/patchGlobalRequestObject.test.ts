import { describe, it, expect, afterEach } from "vitest";
import { patchGlobalRequestObject } from "../src/patchGlobalRequestObject.js";

describe("patchGlobalRequestObject", () => {
  const OriginalRequest = globalThis.Request;

  afterEach(() => {
    globalThis.Request = OriginalRequest;
  });

  it("strips the cache property from init", () => {
    patchGlobalRequestObject();

    const req = new Request("https://example.com", {
      cache: "no-store",
      method: "GET",
    } as any);

    expect(req.method).toBe("GET");
    expect(req.url).toBe("https://example.com/");
  });

  it("works normally when no cache property is present", () => {
    patchGlobalRequestObject();

    const req = new Request("https://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    expect(req.method).toBe("POST");
    expect(req.headers.get("Content-Type")).toBe("application/json");
  });

  it("works when init is undefined", () => {
    patchGlobalRequestObject();

    const req = new Request("https://example.com");
    expect(req.url).toBe("https://example.com/");
  });

  it("preserves other init properties alongside cache", () => {
    patchGlobalRequestObject();

    const req = new Request("https://example.com", {
      cache: "no-cache",
      method: "PUT",
      headers: { "X-Custom": "value" },
    } as any);

    expect(req.method).toBe("PUT");
    expect(req.headers.get("X-Custom")).toBe("value");
  });
});
