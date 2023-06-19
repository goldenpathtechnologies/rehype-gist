import { ReactElement } from "react";
import { cx } from "tagged-classnames";

export default function Footer(): ReactElement {
  return (
    <div
      className={cx`
        container mx-auto max-w-5xl bg-stone-400 p-4 text-center text-sm dark:bg-stone-800
        text-stone-800 dark:text-amber-50
      `}
    >
      Copyright &copy; {(new Date()).getFullYear()} Golden Path Technologies Inc.
    </div>
  );
}
