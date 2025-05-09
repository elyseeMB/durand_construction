import { useEffect, useMemo, useState } from "preact/hooks";

export function useIncrementalNumber(
  n: number,
  duration: number = 1000,
  delay: number = 0
) {
  const start = useMemo(() => Date.now(), []);
  const [count, SetCount] = useState({ number: 0 });

  useEffect(() => {
    const updateValue = () => {
      const elapsedRatio = Math.max((Date.now() - start - delay) / duration, 0);
      if (elapsedRatio >= 1) {
        SetCount((v) => ({ ...v, number: n }));
        return;
      }
      SetCount((v) => ({ ...v, number: Math.floor(n * elapsedRatio) }));
      requestAnimationFrame(updateValue);
    };
    updateValue();
  }, []);

  return count.number;
}
