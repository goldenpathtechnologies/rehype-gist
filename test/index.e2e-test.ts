import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { Element, Root } from "hast";
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

  it(`Retains default 'replaceParentParagraph' configuration value when omitted from plugin options`, async () => {
    const input = `
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <p>
      <code>gist:darylwright/75332f27a6e9bff70bc0406114570829</code>
    </p>
  </body>
</html>
    `;
    const output0 = await unified()
      .use(rehypeParse)
      .use(rehypeGist, {
        classNames: [`my-class`],
      })
      .use(rehypeStringify)
      .process(input);
    const outputTree0: Root = fromHtml(output0);
    const output1 = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(input);
    const outputTree1: Root = fromHtml(output1);

    const gistVisited = import.meta.jest.fn();
    const visitTree = (tree: Root) => {
      visit(
        tree,
        (node: Element) => node.tagName === `div`
            && node.properties !== undefined
            && node.properties.className !== undefined
            && (node.properties.className as string[]).includes(`gist`),
        (_node, _index, parent: Element) => {
          expect(parent.tagName).not.toBe(`p`);
          gistVisited();
        },
      );
    };

    visitTree(outputTree0);
    visitTree(outputTree1);
    expect(gistVisited).toHaveBeenCalledTimes(2);
  });

  it(`Retains default 'omitCodeBlocks' configuration value when omitted from plugin options`, async () => {
    const input = `
<!doctype html>
<html lang="en">
  <head>
    <title>Transform inline code to static GitHub Gist</title>
  </head>
  <body>
    <pre>
      <code>gist:darylwright/75332f27a6e9bff70bc0406114570829</code>
    </pre>
  </body>
</html>
    `;
    const output0 = await unified()
      .use(rehypeParse)
      .use(rehypeGist, {
        classNames: [`my-class`],
      })
      .use(rehypeStringify)
      .process(input);
    const outputTree0: Root = fromHtml(output0);
    const output1 = await unified()
      .use(rehypeParse)
      .use(rehypeGist)
      .use(rehypeStringify)
      .process(input);
    const outputTree1: Root = fromHtml(output1);

    const visitTree = (tree: Root) => {
      visit(tree, `div`, (node: Element, _, parent: Element) => {
        if (node.properties
          && node.properties.className
          && (node.properties.className as string[]).includes(`gist`)
        ) {
          expect(parent.tagName).not.toBe(`pre`);
        }
      });
    };

    visitTree(outputTree0);
    visitTree(outputTree1);
  });
});
