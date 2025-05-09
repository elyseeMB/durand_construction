import type { FC, JSX } from "preact/compat";

type Props = {};

export const Card: FC<Props> = ({ children }) => {
  return <div class="card">{children}</div>;
};
