import { useFetch } from "../../functions/data.ts";
import { useIncrementalNumber } from "../hooks/iseIncrementalNumber.ts";

export function Value({ count }: { count: number }) {
  const animatedCount = useIncrementalNumber(count, 700, 0);

  return <span>{animatedCount}</span>;
}
