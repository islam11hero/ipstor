/** Deterministic 32-bit hash — no runtime entropy. */
export function hashSlug(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function hashSlot(seed: string, slot: number): number {
  return hashSlug(`${seed}::${slot}`);
}

/** Inclusive range [min, max] derived from seed + slot. */
export function countInRange(
  seed: string,
  slot: number,
  min: number,
  max: number
): number {
  const span = max - min + 1;
  return min + (hashSlot(seed, slot) % span);
}

export function pickFromPool<T>(
  pool: readonly T[],
  seed: string,
  slot: number
): T {
  return pool[hashSlot(seed, slot) % pool.length]!;
}

export function pickUniqueIndices(
  poolSize: number,
  count: number,
  seed: string,
  slot: number
): number[] {
  const target = Math.min(count, poolSize);
  if (target <= 0 || poolSize <= 0) return [];

  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = 0; i < target; i++) {
    const j = i + (hashSlot(seed, slot + i) % (poolSize - i));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, target);
}

export function layoutVariantFromSeed(seed: string): 0 | 1 | 2 {
  return (hashSlug(seed) % 3) as 0 | 1 | 2;
}
