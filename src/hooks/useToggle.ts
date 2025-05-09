import { useState } from "preact/hooks";

export function useToggle(
  initial: boolean = false
): [boolean, () => any, (v: boolean) => any] {
  const [state, setState] = useState(initial);
  return [state, () => setState((s) => !s), setState];
}
