export function isObject(item: unknown): boolean {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

export default function deepMerge<
  T extends Record<string, unknown>,
  R extends Record<string, unknown>,
>(target: T, source: R): R & T {
  const output: Record<string, unknown> = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(
            target[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>,
          );
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output as R & T;
}
