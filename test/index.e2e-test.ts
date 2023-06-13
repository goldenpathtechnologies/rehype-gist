// eslint-disable-next-line import/no-extraneous-dependencies
import { unified } from "unified";
// eslint-disable-next-line import/no-extraneous-dependencies
import rehypeParse from "rehype-parse";
// eslint-disable-next-line import/no-extraneous-dependencies
import rehypeStringify from "rehype-stringify";
// eslint-disable-next-line import/no-extraneous-dependencies
import remarkParse from "remark-parse";
// eslint-disable-next-line import/no-extraneous-dependencies
import remarkRehype from "remark-rehype";
import rehypeGist from "../src/index.js";

describe(`Integration tests`, () => {
  it(`Transforms an HTML document`, async () => {
    const output = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(`
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <code>gist:darylwright/75332f27a6e9bff70bc0406114570829</code>
  </body>
</html>
      `);

    expect(output).toMatchSnapshot();
  });

  it(`Transforms a 'code' tag specifying highlights`, async () => {
    const output = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(`
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <code>gist:darylwright/75332f27a6e9bff70bc0406114570829?file=gist-test.ts&highlights=2-3,5</code>
  </body>
</html>
      `);

    expect(output).toMatchSnapshot();
  });

  it(`Transforms a 'code' tag specifying removed lines`, async () => {
    const output = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(`
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <code>gist:darylwright/75332f27a6e9bff70bc0406114570829?file=gist-test.ts&lines=1,5</code>
  </body>
</html>
      `);

    expect(output).toMatchSnapshot();
  });

  it(`Transforms a 'code' tag specifying highlights and removed lines`, async () => {
    const output = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(`
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <code>gist:darylwright/75332f27a6e9bff70bc0406114570829?file=gist-test.ts&highlights=1-3&lines=5</code>
  </body>
</html>
      `);

    expect(output).toMatchSnapshot();
  });

  it(`Transforms code tags generated from inline code in Markdown`, async () => {
    const output = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(`
# rehype-gist

**A rehype plugin for embedding static GitHub Gists in your HTML and MD/X content.**

## Demo

\`gist:darylwright/75332f27a6e9bff70bc0406114570829\`

## License

This project is MIT licensed.
      `);

    expect(output).toMatchSnapshot();
  });
});
