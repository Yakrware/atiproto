import type {
  SimpleStore,
  Key,
  Value,
  GetOptions,
} from "@atproto-labs/simple-store";

/**
 * Two-tier read-through cache combining a fast L1 (typically in-memory)
 * with a durable L2 (typically Cache API or KV).
 *
 * - get: check L1, on miss check L2, on L2 hit populate L1
 * - set: write to both L1 and L2
 * - del: delete from both
 * - clear: clear L1 only (L2 may not support bulk delete)
 */
export class TieredStore<K extends Key, V extends Value> implements SimpleStore<
  K,
  V
> {
  constructor(
    private readonly l1: SimpleStore<K, V>,
    private readonly l2: SimpleStore<K, V>,
  ) {}

  async get(key: K, options?: GetOptions): Promise<V | undefined> {
    const l1Value = await this.l1.get(key, options);
    if (l1Value !== undefined) return l1Value;

    const l2Value = await this.l2.get(key, options);
    if (l2Value !== undefined) {
      // Populate L1 from L2 hit — fire and forget
      void Promise.resolve(this.l1.set(key, l2Value)).catch(() => {});
      return l2Value;
    }

    return undefined;
  }

  async set(key: K, value: V): Promise<void> {
    await Promise.all([this.l1.set(key, value), this.l2.set(key, value)]);
  }

  async del(key: K): Promise<void> {
    await Promise.all([this.l1.del(key), this.l2.del(key)]);
  }

  clear(): void {
    this.l1.clear?.();
  }
}
