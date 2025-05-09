import type { PropsWithChildren } from "preact/compat";

export function Wrapper(chidren: PropsWithChildren) {
  return <div>{chidren}</div>;
}
