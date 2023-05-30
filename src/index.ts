import axios from "axios";
import parseRange from "parse-numeric-range";
import {load} from "cheerio";
import qs from "qs";
import {Transformer} from "unified";
import { visit, VisitorResult } from "unist-util-visit";
import {classnames as cx} from "hast-util-classnames";
import {isElement} from "hast-util-is-element";
import {Root, Parent, Element, Text} from "hast";
import {fromHtml} from "hast-util-from-html";

type GistProps = {
  username: string;
  gistId: string;
  file?: string;
  lines?: string;
  highlights?: string;
};

const baseGistUrl = `https://gist.github.com`;

function parseGistProtocolUri(gistUri: string): GistProps | undefined {
  if (!gistUri.startsWith(`gist:`)) return;

  const uriSegments = gistUri.replace(`gist:`, ``).split(/[/?]/);

  if (uriSegments.length === 2) return {
    username: uriSegments[0],
    gistId: uriSegments[1],
  };

  if (uriSegments.length !== 3) return;

  const [username, gistId, queryString] = uriSegments;

  let gistQuery = qs.parse(queryString, { comma: false });

  return {
    username,
    gistId,
    // TODO: Find a better way than casting to String.
    file: String(gistQuery.file),
    lines: String(gistQuery.lines),
    highlights: String(gistQuery.highlights),
  };
}

async function getGistHtml(gistUri: string): Promise<string> {
  const source = parseGistProtocolUri(gistUri);

  if (!source) return `<div class="bg-tertiary rounded-lg p-4 text-sm">Failed to load Gist: incorrect URI format</div>`;

  const gistUrl = `${baseGistUrl}/${source.username}/${source.gistId}.json${source.file ? `?file=${source.file}` : ``}`;

  const {data} = await axios.get(gistUrl);

  const gistHtml = data.div;
  const highlights = source.highlights ? parseRange(source.highlights) : [];
  const lines = source.lines ? parseRange(source.lines) : [];
  const hasHighlights = highlights.length > 0;
  const hasLines = lines.length > 0;
  const canProcessLinesAndHighlights = (hasLines || hasHighlights) && source.file;

  if (!canProcessLinesAndHighlights) return gistHtml;

  // handle line removal and highlights
  const $ = load(gistHtml, null, false);
  const file = source.file?.replace(/^\./, ``)
    .replace(/[^a-zA-Z0-9_]+/g, `-`)
    .toLowerCase();

  // highlight the specific lines, if any
  highlights.forEach((line) => {
    $(`#file-${file}-LC${line}`).addClass(`highlighted`);
  });

  // remove the specific lines, if any
  const codeLines = parseRange(`1-${$(`table tr`).length}`);
  codeLines.forEach((line) => {
    if (lines.includes(line)) return;

    $(`#file-${file}-LC${line}`).parent().remove();
  });

  return $.html().trim();
}

type RemarkGistOptions = {
  replaceParentParagraph?: boolean;
  omitCodeBlocks?: boolean;
  classNames?: string | string[];
};

export default function RemarkGist(
  {
    replaceParentParagraph = true,
    omitCodeBlocks = true,
    classNames,
  }: RemarkGistOptions,
) {
  const transformer: Transformer<Root> = async (tree): Promise<Root> => {
    const transformations: Promise<void>[] = [];
    visit(
      tree,
      (node: Element) => {
        return isElement(node, `code`)
          && node.children.length === 1
          && node.children[0].type === `text`
          && node.children[0].value.startsWith(`gist:`);
      },
      (node: Element, _, parent: Parent): VisitorResult => {
      if (omitCodeBlocks && isElement(parent, `pre`)) return;
      if (isElement(parent, `p`) && parent.children.length > 1) return; // Can't replace p tag if it contains more that our target gist element

      const gistUri = (node.children[0] as Text).value;

      transformations.push(
        new Promise<void>(async (resolve, reject) => {
          try {
            const gistHtml = await getGistHtml(gistUri);
            const rootFragment: Root = fromHtml(gistHtml, { fragment: true });
            const rootElements: Element[] = rootFragment.children
              .filter((child) => isElement(child))
              .map((child) => child as Element);

            if (rootElements.length !== 1) reject(`Gist doesn't exist or has no content`);

            const newNode: Element = cx(rootElements[0] as Element, classNames);

            if (replaceParentParagraph && isElement(parent) && isElement(parent, `p`)) {
              Object.assign(parent, newNode);
            } else {
              Object.assign(node, newNode);
            }

            resolve();
          } catch (error) {
            console.error(error);
            reject(error);
          }
        }),
      );
    });

    await Promise.all(transformations);

    return tree;
  }

  return transformer;
}
