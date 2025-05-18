import type { PropsWithChildren } from "preact/compat";

export function Wrapper(chidren: PropsWithChildren) {
  console.log("first");
  return <div>{chidren}</div>;
}
