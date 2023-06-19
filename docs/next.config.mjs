import mdxConfig from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeGist from "rehype-gist";

const withMDX = mdxConfig({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkGfm,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeGist, {
        classNames: `not-prose my-4 border-0`,
      }],
      [rehypePrettyCode, {
        theme: `one-dark-pro`,
        keepBackground: true,
        onVisitHighlightedLine: (node) => {
          // Each line node by default has `class="line"`.
          node.properties.className.push('highlighted');
        },
      }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: [`tsx`, `jsx`, `md`, `mdx`],
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  output: `export`,
  trailingSlash: true,
};

export default withMDX(nextConfig);
