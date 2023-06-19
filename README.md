# rehype-gist

A rehype plugin for embedding static GitHub Gists in your HTML and MD/X content.

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
![GitHub](https://img.shields.io/github/license/goldenpathtechnologies/rehype-gist)

## Demo

`gist:darylwright/75332f27a6e9bff70bc0406114570829`

The above will render a static GitHub Gist on the [`rehype-gist` homepage](https://rehype-gist.goldenpath.ca/).
More demos can be found [here](https://rehype-gist.goldenpath.ca/demo/).

## Installation

PNPM:

```bash
pnpm add rehype-gist
```

NPM:

```bash
npm install rehype-gist
```

Yarn:

```bash
yarn install rehype-gist
```

### Styling

`rehype-gist` depends on GitHub's Gist stylesheet. Run the following script to download a copy of this
stylesheet to use in your project:

#### Unix shell

```bash
curl -s https://gist.github.com/darylwright/75332f27a6e9bff70bc0406114570829.json | jq .stylesheet | xargs -n 1 curl -s -o gist-embed.css
```

#### PowerShell

```powershell
iwr $(iwr https://gist.github.com/darylwright/75332f27a6e9bff70bc0406114570829.json | ConvertFrom-Json).stylesheet -OutFile gist-embed.css
```

Alternatively, you can browse any Gist's JSON in your browser and find the URL of the stylesheet.

```json {8}
{
  "description": "This is an example code snippet used for test data",
  "public": true,
  "created_at": "2023-06-01T09:50:34.000-03:00",
  "files": ["gist-test.ts"],
  "owner": "darylwright",
  "div": "...",
  "stylesheet": "https://github.githubassets.com/assets/gist-embed-38d69729aad4.css"
}
```

The default theme of the downloaded stylesheet is GitHub Light. You can change the default appearance
by importing themes from elsewhere. [`gist-syntax-themes`](https://github.com/lonekorean/gist-syntax-themes)
is a good source of attractive themes for your Gists. Ensure all stylesheets are imported globally in
your project.

The Gists as styled with the default stylesheet have a white border that doesn't align well with the
content. Copy and paste the following CSS in your project's global stylesheet to remove this border
for all your embedded Gists.

```css
.gist table,
.gist th,
.gist td {
    border-width: 0 !important;
}
body .gist .gist-file {
    border-width: 0;
}
```

## Configuration

| Name                   | Type               | Default | Description                                                                                                                             |
|------------------------|--------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------|
| replaceParentParagraph | boolean            | true    | Transform the parent `<p>` of the qualifying `<code>` element into a Gist. Doesn't transform if the Gist `<code>` element has siblings. |
| omitCodeBlocks         | boolean            | true    | Do not transform `<code>` element whose parent is a `<pre>` element.                                                                    |
| classNames             | string or string[] |         | A list of class names to apply to the root element of the rendered Gist.                                                                |

### Example

```typescript
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeGist from "rehype-gist";

const output = await unified()
  .use(rehypeParse)
  .use(rehypeGist, {
    replaceParentParagraph: false,
    omitCodeBlocks: false,
    classNames: [`border-2`, `my-4`],
  })
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
```

## Notes

This plugin should be declared before any others that transform `<code>` tags, or the Gists will not
be rendered.

Highlights and removed lines can only be applied to one file at a time in a Gist. Multi-file Gists
can still be displayed without highlights and removed lines.

## Issues

Please report any issues with this software
[here](https://github.com/goldenpathtechnologies/rehype-gist/issues). If you would like to contribute to
this project, feel free to fork it and send a pull request. Note that this project is governed by a
[code of conduct](https://github.com/goldenpathtechnologies/rehype-gist/blob/main/CODE_OF_CONDUCT.md).

## Acknowledgements

This project was inspired by [`gatsby-remark-embed-gist`](https://github.com/weirdpattern/gatsby-remark-embed-gist)
by [Patricio Treviño](https://www.weirdpattern.com/).

## License

This project is [MIT](https://github.com/goldenpathtechnologies/rehype-gist/blob/main/LICENSE.md)
licensed.
