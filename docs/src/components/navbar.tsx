/* eslint-disable import/extensions */
import shortid from "shortid";
import { ReactElement } from "react";
import { cx } from "tagged-classnames";
import ThemeButton from "@/components/theme-button";

type NavItem = {
  name: string;
  url: string;
};

export default function Navbar(): ReactElement {
  const navItems: NavItem[] = [
    { name: `Demo`, url: `/demo/` },
    { name: `Changelog`, url: `/changelog/` },
    { name: `Code of Conduct`, url: `/code-of-conduct/` },
    { name: `License`, url: `/license/` },
  ];

  return (
    <div
      className={cx`
        container mx-auto max-w-5xl bg-stone-400 dark:bg-stone-800 px-5 py-4 uppercase md:py-4
      `}
    >
      <ul className="text-sm text-stone-800 dark:text-amber-50 md:flex">
        <li
          className={cx`
            mb-4 md:mb-0 mx-4 block md:inline-flex items-center text-2xl font-extrabold normal-case tracking-wider
          `}
        >
          <a href="/">rehype-gist</a>
        </li>
        {navItems.map((item: NavItem) => (
          <li className="mx-4 block items-center md:inline-flex" key={shortid.generate()}>
            <a href={item.url}>
              {item.name}
            </a>
          </li>
        ))}
        <li className="mx-4 mt-4 block items-center md:mt-0 md:inline-flex">
          <ThemeButton />
        </li>
      </ul>
    </div>
  );
}
