/* eslint-disable react/jsx-props-no-spreading, import/extensions */
import {
  ComponentPropsWithoutRef,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@wits/next-themes";

/*
  TODO: See this GitHub issue: https://github.com/pacocoursey/next-themes/issues/161
   The original next-themes package does not work with the App folder routes in Next.js.
   The package by user @wits enables this as indicated in the above issue. Use this
   package until the original by @pacocoursey is updated to work with App folder routes.
*/

type ThemeButtonProps = Omit<ComponentPropsWithoutRef<`button`>, `children`>;

export default function ThemeButton(
  { className, ...props }: ThemeButtonProps,
): ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme === `system`) {
      const isSystemThemeDark = window.matchMedia(`(prefers-color-scheme: dark)`).matches;
      setTheme(isSystemThemeDark ? `dark` : `light`);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      className={`flex w-8 align-middle ${className ?? ``}`}
      onClick={() => setTheme(theme === `dark` ? `light` : `dark`)}
      {...props}
    >
      <span className="text-lg">
        {
          theme === `dark`
            ? (
              <span>
                <FontAwesomeIcon icon={faMoon} />
                <span className="sr-only">dark mode button</span>
              </span>
            )
            : (
              <span>
                <FontAwesomeIcon icon={faSun} />
                <span className="sr-only">light mode button</span>
              </span>
            )
        }
      </span>
    </button>
  );
}
