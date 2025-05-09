export function classNames(...classnames: string[]) {
  return classnames
    .filter((classname) => classname !== null && Boolean(classname) !== false)
    .join(" ");
}
