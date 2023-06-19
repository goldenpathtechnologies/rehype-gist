import { ReactElement } from "react";

export default function GithubRibbon(): ReactElement {
  return (
    <a href="https://github.com/goldenpathtechnologies/rehype-gist" className="not-prose">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        decoding="async"
        loading="lazy"
        width="149"
        height="149"
        src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149"
        className="absolute right-0 top-0"
        alt="Fork me on GitHub"
        data-recalc-dims="1"
      />
    </a>
  );
}
