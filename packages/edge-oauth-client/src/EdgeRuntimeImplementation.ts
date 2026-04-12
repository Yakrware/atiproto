import type { RuntimeImplementation } from "@atproto/oauth-client";
import { JoseKey } from "@atproto/jwk-jose";

/**
 * WebCrypto-based RuntimeImplementation for @atproto/oauth-client.
 * Compatible with Cloudflare Workers and other edge runtimes.
 */
export class EdgeRuntimeImplementation implements RuntimeImplementation {
  private locks = new Map<string, Promise<unknown>>();

  createKey(algs: string[]) {
    return JoseKey.generate(algs);
  }

  getRandomValues(length: number) {
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    return buf;
  }

  async digest(
    data: Uint8Array,
    alg: { name: "sha256" | "sha384" | "sha512" },
  ) {
    const hashName = alg.name.replace(/^sha(\d+)$/, "SHA-$1");
    const result = await crypto.subtle.digest(
      hashName,
      new Uint8Array(data).buffer as ArrayBuffer,
    );
    return new Uint8Array(result);
  }

  async requestLock<T>(name: string, fn: () => T | PromiseLike<T>): Promise<T> {
    while (this.locks.has(name)) {
      await this.locks.get(name);
    }
    const promise = Promise.resolve().then(fn);
    const guard = promise.then(
      () => {},
      () => {},
    );
    this.locks.set(
      name,
      guard.then(() => this.locks.delete(name)),
    );
    return promise;
  }
}
